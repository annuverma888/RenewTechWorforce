const https = require('https');

const BASE_URL = 'renewtechworforce.onrender.com';
const FRONTEND_ORIGIN = 'https://renew-tech-worforce-vu14-k9p068elc.vercel.app';

function request({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path,
      method,
      headers: {
        'User-Agent': 'RenewTech-Production-SmokeTest/1.0',
        Origin: FRONTEND_ORIGIN,
        ...headers,
      },
    };

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error(`Timeout after 25s for ${method} ${path}`));
    });

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(payload);
    }
    req.end();
  });
}

async function runProductionSmoke() {
  console.log('===============================================================');
  console.log('  RENEWTECH WORKFORCE — LIVE PRODUCTION BACKEND SMOKE TEST     ');
  console.log(`  Target Backend:  https://${BASE_URL}                        `);
  console.log(`  Origin Header:   ${FRONTEND_ORIGIN}                         `);
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '--> ' + details : ''}`);
      failed++;
    }
  }

  let techToken = null;
  let techUser = null;
  let epcToken = null;
  let epcUser = null;
  let sampleProjectId = null;

  try {
    // 1. Health & Root Check
    console.log('--- 1. Health & Root Check ---');
    const rootRes = await request({ path: '/' });
    assert(rootRes.status === 200 && rootRes.data?.status === 'healthy', 'GET / returns 200 healthy');

    const healthRes = await request({ path: '/api/health' });
    assert(healthRes.status === 200 && healthRes.data?.status === 'healthy', 'GET /api/health returns 200 healthy');

    // 2. CORS Preflight Simulation
    console.log('\n--- 2. CORS Preflight Simulation ---');
    const corsRes = await request({
      path: '/api/auth/login',
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });
    const allowOrigin = corsRes.headers['access-control-allow-origin'];
    const allowCreds = corsRes.headers['access-control-allow-credentials'];
    assert(
      (allowOrigin === FRONTEND_ORIGIN || allowOrigin === '*') && allowCreds === 'true',
      'OPTIONS /api/auth/login allows frontend Vercel origin with credentials',
      `Allow-Origin: ${allowOrigin}, Allow-Credentials: ${allowCreds}`
    );

    // 3. Public Projects Directory
    console.log('\n--- 3. Public Projects Directory ---');
    const projectsRes = await request({ path: '/api/projects' });
    assert(projectsRes.status === 200 && Array.isArray(projectsRes.data?.data || projectsRes.data?.projects), 'GET /api/projects returns 200 with list');
    const projectsList = projectsRes.data?.data || projectsRes.data?.projects || [];
    console.log(`       Found ${projectsList.length} public projects in production DB.`);
    if (projectsList.length > 0) {
      sampleProjectId = projectsList[0]._id || projectsList[0].id;
      console.log(`       Sample Project ID: ${sampleProjectId} (${projectsList[0].projectName})`);
    }

    if (sampleProjectId) {
      const projDetailRes = await request({ path: `/api/projects/${sampleProjectId}` });
      assert(projDetailRes.status === 200, `GET /api/projects/${sampleProjectId} returns 200 details`);
    }

    const invalidProjRes = await request({ path: '/api/projects/654321098765432109876543' });
    assert(invalidProjRes.status === 404 || invalidProjRes.status === 400, 'GET /api/projects/invalid returns 404/400 (no crash)');

    // 4. Public Technicians Directory
    console.log('\n--- 4. Public Technicians Directory ---');
    const techsRes = await request({ path: '/api/technicians' });
    assert(techsRes.status === 200 && Array.isArray(techsRes.data?.data || techsRes.data?.technicians), 'GET /api/technicians returns 200');
    const techList = techsRes.data?.data || techsRes.data?.technicians || [];
    console.log(`       Found ${techList.length} technicians in production DB.`);

    // 5. Authentication: Technician Login
    console.log('\n--- 5. Technician Login ---');
    const techLoginRes = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: 'qa.technician.smoke.2026@renewtech.com', password: 'QATestPassword@2026' },
    });
    assert(techLoginRes.status === 200 && techLoginRes.data?.token, 'Technician login returns 200 with JWT');
    assert(techLoginRes.data?.user?.role === 'technician', 'User role is correctly identified as technician');
    techToken = techLoginRes.data?.token;
    techUser = techLoginRes.data?.user;

    const meRes = await request({
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(meRes.status === 200 && meRes.data?.user?.email === 'qa.technician.smoke.2026@renewtech.com', 'GET /api/auth/me returns authenticated technician session');

    // 6. Technician Availability Update & Persistence
    console.log('\n--- 6. Technician Profile & Availability ---');
    const setAvailRes = await request({
      path: '/api/technicians/availability',
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { availability: 'On Project' },
    });
    assert(setAvailRes.status === 200, 'PUT /api/technicians/availability to "On Project" succeeds');

    const resetAvailRes = await request({
      path: '/api/technicians/availability',
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { availability: 'Available' },
    });
    assert(resetAvailRes.status === 200, 'PUT /api/technicians/availability restored to "Available"');

    // 7. Technician Matching / Recommended Projects
    console.log('\n--- 7. Technician Matching / Recommended Projects ---');
    const recommendedRes = await request({
      path: '/api/matching/technician/recommended',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(recommendedRes.status === 200, 'GET /api/matching/technician/recommended returns 200');
    const recProjects = recommendedRes.data?.recommendations || recommendedRes.data?.data || [];
    console.log(`       Received ${recProjects.length} recommended projects with match scoring.`);

    // 8. Technician Applications List
    console.log('\n--- 8. Technician Applications ---');
    const myAppsRes = await request({
      path: '/api/applications',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(myAppsRes.status === 200, 'GET /api/applications returns 200 for Technician');

    // 9. Skill Passport & Public QR Verification
    console.log('\n--- 9. Skill Passport & Public QR Verification ---');
    const passportTargetId = techUser?.id;
    if (passportTargetId) {
      const passportRes = await request({ path: `/api/technicians/verify/${passportTargetId}` });
      assert(passportRes.status === 200 && passportRes.data?.success === true, `Public GET /api/technicians/verify/${passportTargetId} succeeds without auth`);
      const passportData = passportRes.data?.data;
      console.log(`       Passport verified for: ${passportData?.technician?.name || 'Verified Technician'}`);
      console.log(`       Passport ID: ${passportData?.passportId}`);
      console.log(`       Verification Seal: ${passportData?.verificationSeal}`);
    }

    const invalidPassportRes = await request({ path: '/api/technicians/verify/invalid-qa-id' });
    assert(invalidPassportRes.status === 404 && invalidPassportRes.data?.notFound === true, 'Invalid passport ID returns clean 404 with notFound: true');

    // 10. Authentication: EPC Company Login
    console.log('\n--- 10. EPC Company Login ---');
    const epcLoginRes = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: 'qa.epc.smoke.2026@renewtech.com', password: 'QAEpcPassword@2026' },
    });
    assert(epcLoginRes.status === 200 && epcLoginRes.data?.token, 'EPC login returns 200 with JWT');
    assert(epcLoginRes.data?.user?.role === 'epc_company', 'User role is correctly identified as epc_company');
    epcToken = epcLoginRes.data?.token;
    epcUser = epcLoginRes.data?.user;

    const epcProjectsRes = await request({
      path: `/api/projects?companyId=${epcUser?.id}`,
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(epcProjectsRes.status === 200, 'GET /api/projects?companyId returns 200 for EPC');

    const epcAppsRes = await request({
      path: '/api/applications',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(epcAppsRes.status === 200, 'GET /api/applications returns 200 for EPC');

    const epcWorkforceRes = await request({
      path: '/api/workforce',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(epcWorkforceRes.status === 200, 'GET /api/workforce returns 200 for EPC');

    if (sampleProjectId) {
      const matchProjectRes = await request({
        path: `/api/matching/project/${sampleProjectId}`,
        headers: { Authorization: `Bearer ${epcToken}` },
      });
      assert(matchProjectRes.status === 200, `GET /api/matching/project/${sampleProjectId} returns 200 match breakdown`);
    }

    // 11. Role Isolation & Security Tests
    console.log('\n--- 11. Role Isolation & Security Tests ---');
    // Technician blocked from admin analytics
    const techOnAdmin = await request({
      path: '/api/admin/analytics',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(techOnAdmin.status === 403, 'Technician blocked from /api/admin/analytics with 403 Forbidden');

    // Technician blocked from creating workforce assignment (POST /api/workforce)
    const techPostWorkforce = await request({
      path: '/api/workforce',
      method: 'POST',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { project: sampleProjectId, technician: techUser?.id },
    });
    assert(techPostWorkforce.status === 403, 'Technician blocked from POST /api/workforce with 403 Forbidden');

    // EPC blocked from admin analytics
    const epcOnAdmin = await request({
      path: '/api/admin/analytics',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(epcOnAdmin.status === 403, 'EPC blocked from /api/admin/analytics with 403 Forbidden');

    // EPC blocked from technician-only recommended matching
    const epcOnTechRec = await request({
      path: '/api/matching/technician/recommended',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(epcOnTechRec.status === 403, 'EPC blocked from /api/matching/technician/recommended with 403 Forbidden');

    // Unauthenticated request to protected endpoint
    const noAuth = await request({
      path: '/api/workforce',
    });
    assert(noAuth.status === 401, 'Unauthenticated request to /api/workforce rejected with 401 Unauthorized');

  } catch (err) {
    console.error('[UNEXPECTED ERROR IN TEST SUITE]:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`  BACKEND SMOKE TEST RESULTS: Passed: ${passed} | Failed: ${failed}`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runProductionSmoke();
