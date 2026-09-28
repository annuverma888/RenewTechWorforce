const http = require('http');

// Helper to make HTTP requests without external dependencies
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   RENEWTECH WORKFORCE - BACKEND API TEST SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Root & Health check
    console.log('[Test 1]: API Server Root & Health');
    const rootRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/',
      method: 'GET',
    });
    assert(rootRes.status === 200 && rootRes.data?.status === 'healthy', 'Root / returns status: healthy');

    const health = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && (health.data?.status === 'healthy' || health.data?.status === 'online'), 'Health check returns status: healthy/online');

    // 2. Login Technician
    console.log('\n[Test 2]: Technician Authentication (rahul.kumar@gmail.com)');
    const techLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'rahul.kumar@gmail.com', password: 'Tech@123' }
    );
    assert(techLogin.status === 200 && techLogin.data?.token, 'Technician login returns JWT token');
    assert(techLogin.data?.user?.role === 'technician', 'User role is technician');
    const techToken = techLogin.data?.token;
    const techUserId = techLogin.data?.user?.id;

    // 3. Login EPC Company
    console.log('\n[Test 3]: EPC Company Authentication (contact@greenvolt.in)');
    const epcLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'contact@greenvolt.in', password: 'Company@123' }
    );
    assert(epcLogin.status === 200 && epcLogin.data?.token, 'EPC Company login returns JWT token');
    assert(epcLogin.data?.user?.role === 'epc_company', 'User role is epc_company');
    const epcToken = epcLogin.data?.token;

    // 4. Login Admin
    console.log('\n[Test 4]: Admin Authentication (admin@renewtech.com)');
    const adminLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@renewtech.com', password: 'Admin@123' }
    );
    assert(adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin', 'Admin login successful');
    const adminToken = adminLogin.data?.token;

    // 5. Test Register New Technician
    console.log('\n[Test 5]: New Technician Registration');
    const randomEmail = `test.tech.${Date.now()}@renewtech.com`;
    const regRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Devendra Patel',
        email: randomEmail,
        phone: '+91 99887 76655',
        password: 'Password@123',
        role: 'technician',
        profession: 'Solar O&M Technician',
        city: 'Surat',
        state: 'Gujarat',
      }
    );
    assert(regRes.status === 201 && regRes.data?.token, 'Registration creates user, profile, and returns token');

    // 6. Test GET /api/auth/me
    console.log('\n[Test 6]: Protected /api/auth/me Session Validation');
    const meRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(meRes.status === 200 && meRes.data?.user?.email === 'rahul.kumar@gmail.com', 'Returns valid technician profile session');

    // 7. Test GET /api/technicians with filters
    console.log('\n[Test 7]: Filtered Technicians Directory');
    const techList = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/technicians?location=Kanpur',
      method: 'GET',
    });
    assert(techList.status === 200 && techList.data?.count >= 1, `Technician filter by location returned ${techList.data?.count} results`);

    // 8. Test GET Digital Skill Passport
    console.log('\n[Test 8]: Digital Skill Passport Generation');
    const passportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${techUserId}/passport`,
      method: 'GET',
    });
    assert(passportRes.status === 200 && passportRes.data?.data?.passportId, 'Passport payload generated with ID');
    assert(passportRes.data?.data?.verifiedCertificates?.length > 0, 'Verified certificates displayed on Passport');

    // 9. Test Assessments API
    console.log('\n[Test 9]: Skill Assessment Quiz Engine');
    const assessList = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/assessments',
      method: 'GET',
    });
    assert(assessList.status === 200 && assessList.data?.count >= 2, 'Returns Solar and Wind competency assessments');
    const solarAssess = assessList.data?.data?.find((a) => a.category === 'Solar');

    // 10. Test Projects List
    console.log('\n[Test 10]: EPC Projects Marketplace');
    const projectsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/projects',
      method: 'GET',
    });
    assert(projectsRes.status === 200 && projectsRes.data?.count >= 4, `Found ${projectsRes.data?.count} renewable projects`);
    const project1 = projectsRes.data?.data?.find((p) => p.projectName.includes('500kW Solar'));

    // 11. Test Smart Matching Engine
    console.log('\n[Test 11]: Smart AI / Rule-Based Matching Engine Execution');
    const matchRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/matching/project/${project1._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(matchRes.status === 200 && matchRes.data?.count > 0, 'Matching engine executed on project');
    const topMatch = matchRes.data?.data?.[0];
    assert(topMatch.matchScore >= 80, `Top candidate achieved ${topMatch.matchScore}% Match Score`);
    assert(topMatch.breakdown?.reasons?.length > 0, 'Explainability output generated: ' + topMatch.breakdown?.reasons?.[0]);

    // 12. Test Post Project by EPC Company
    console.log('\n[Test 12]: EPC Company Post New Project');
    const newProjRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        projectName: '750kW Commercial Rooftop Solar Array',
        projectType: 'Solar',
        description: 'Commercial rooftop setup for industrial automotive parts plant.',
        location: {
          city: 'Greater Noida',
          state: 'Uttar Pradesh',
          address: 'Ecotech III Industrial Park',
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 25 * 86400000),
        numberWorkers: 6,
        requiredSkills: ['PV Installation', 'Inverter Installation', 'Electrical Safety'],
        minimumExperience: 2,
        requiredCertifications: ['Solar PV Installer'],
        budget: 600000,
      }
    );
    assert(newProjRes.status === 201 && newProjRes.data?.data?.projectName, 'New project created successfully');

    // 13. Test Workforce Roster Retrieval
    console.log('\n[Test 13]: Workforce Roster & Progress Tracking');
    const workforceRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/workforce/project/${project1._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(workforceRes.status === 200 && workforceRes.data?.count > 0, `Retrieved ${workforceRes.data?.count} deployed field technicians`);

    // 14. Test Admin Platform Statistics
    console.log('\n[Test 14]: Admin Dashboard Statistics & Analytics');
    const adminStats = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/statistics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStats.status === 200 && adminStats.data?.data?.totalTechnicians >= 5, 'Admin statistics returns platform metrics');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test Suite Exception:', error);
    process.exit(1);
  }
}

runTests();
