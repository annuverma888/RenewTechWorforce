const http = require('http');

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

async function runAdminAnalyticsTests() {
  console.log('================================================================');
  console.log('       ADMIN DASHBOARD & PLATFORM ANALYTICS TEST SUITE          ');
  console.log('================================================================\n');

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
    // 1. Authenticate Admin
    console.log('[Step 1]: Authenticate Admin (admin@renewtech.com)');
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
    assert(adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin', 'Admin authenticated successfully');
    const adminToken = adminLogin.data?.token;

    // 2. Security Role-Based Access Control (RBAC) Guard Test
    console.log('\n[Step 2]: RBAC Access Control Guard Test (Technician Access Denied)');
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
    const techToken = techLogin.data?.token;

    const forbiddenCheck = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/statistics',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(forbiddenCheck.status === 403, 'Technician blocked with HTTP 403 Forbidden from admin routes');

    // 3. Admin Platform Statistics API
    console.log('\n[Step 3]: Query Platform Statistics (GET /api/admin/statistics)');
    const statsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/statistics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statsRes.status === 200 && statsRes.data?.success, 'Admin statistics returned successfully');
    const stats = statsRes.data?.data;
    assert(typeof stats.totalTechnicians === 'number' && stats.totalTechnicians > 0, `Total Technicians: ${stats.totalTechnicians}`);
    assert(typeof stats.totalCompanies === 'number' && stats.totalCompanies > 0, `Total EPC Companies: ${stats.totalCompanies}`);
    assert(typeof stats.activeProjects === 'number', `Active Projects: ${stats.activeProjects}`);
    assert(typeof stats.successfulHires === 'number', `Workforce Assignments: ${stats.successfulHires}`);
    assert(typeof stats.totalProjectBudget === 'number' && stats.totalProjectBudget > 0, `Total Platform Budget: ₹${stats.totalProjectBudget}`);
    assert(stats.renewableSplit && stats.renewableSplit.solar !== undefined, 'Renewable energy Solar/Wind split present');

    // 4. In-Depth Platform Analytics API
    console.log('\n[Step 4]: Query In-Depth Platform Analytics (GET /api/admin/analytics)');
    const analyticsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.status === 200 && analyticsRes.data?.success, 'In-depth platform analytics generated');
    const analytics = analyticsRes.data?.data;

    // Monthly Growth Timeline
    assert(Array.isArray(analytics.monthlyGrowth) && analytics.monthlyGrowth.length === 6, 'Monthly growth timeline generated for 6 months');
    console.log(`  Latest Month (${analytics.monthlyGrowth[5]?.month}): ${analytics.monthlyGrowth[5]?.technicians} Techs, ${analytics.monthlyGrowth[5]?.projects} Projects, ${analytics.monthlyGrowth[5]?.hires} Hires`);

    // Sector & Capital Allocation
    assert(Array.isArray(analytics.sectorBreakdown) && analytics.sectorBreakdown.length > 0, 'Sector project share & capital allocation present');
    const solarSector = analytics.sectorBreakdown.find((s) => s.sector === 'Solar');
    assert(solarSector && solarSector.projectsCount > 0, `Solar Sector: ${solarSector?.projectsCount} projects, ₹${solarSector?.totalBudget} budget`);

    // Regional Geographical Footprint
    assert(Array.isArray(analytics.regionalBreakdown) && analytics.regionalBreakdown.length > 0, 'Geographical regional deployment breakdown present');
    console.log(`  Top Region: ${analytics.regionalBreakdown[0]?.state} (${analytics.regionalBreakdown[0]?.technicians} technicians, ${analytics.regionalBreakdown[0]?.projects} projects)`);

    // Skills Demand vs Supply Gap Analysis
    assert(Array.isArray(analytics.skillsGapAnalysis) && analytics.skillsGapAnalysis.length > 0, 'Skill demand vs supply gap intelligence computed');
    const topSkill = analytics.skillsGapAnalysis[0];
    assert(topSkill.skill && topSkill.status, `Top In-Demand Skill: "${topSkill.skill}" (Demand: ${topSkill.demand}, Supply: ${topSkill.supply}, Status: ${topSkill.status})`);

    // Application & Placement Funnel
    assert(analytics.funnel && typeof analytics.summary?.conversionRate === 'number', `Placement Funnel: ${analytics.summary?.conversionRate}% Conversion Rate`);

    // Assessment Competency Scoring
    assert(analytics.assessmentMetrics && typeof analytics.assessmentMetrics.avgScore === 'number', `Assessment Metrics: ${analytics.assessmentMetrics.avgScore}% Average Score, Pass Rate: ${analytics.assessmentMetrics.passRate}%`);
    assert(analytics.assessmentMetrics.skillLevelDistribution, 'Skill level distribution computed (Novice, Competent, Proficient, Master)');

    // Compliance & Accreditation Health
    assert(analytics.complianceAuditMetrics && typeof analytics.complianceAuditMetrics.auditApprovalRate === 'number', `Compliance Audit Approval Rate: ${analytics.complianceAuditMetrics.auditApprovalRate}%`);
    assert(Array.isArray(analytics.complianceAuditMetrics.topIssuingBodies), 'Top credential issuing bodies breakdown present');

    // Recent Activity Stream
    assert(Array.isArray(analytics.recentActivityStream) && analytics.recentActivityStream.length > 0, `Recent Activity Stream generated with ${analytics.recentActivityStream.length} chronological events`);

    // 5. Technicians Directory Management API
    console.log('\n[Step 5]: Query Technicians Management (GET /api/admin/technicians)');
    const techsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/technicians',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(techsRes.status === 200 && Array.isArray(techsRes.data?.data), `Retrieved ${techsRes.data?.data?.length} technician accounts`);
    const sampleTech = techsRes.data?.data[0];
    assert(sampleTech?.user?.name && sampleTech?.user?.email, `Technician record parsed: ${sampleTech?.user?.name} (${sampleTech?.user?.status})`);
    assert(typeof sampleTech?.verifiedCertificatesCount === 'number', 'Verified certificates count attached');

    // 6. EPC Companies Management API
    console.log('\n[Step 6]: Query Companies Management (GET /api/admin/companies)');
    const companiesRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/companies',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(companiesRes.status === 200 && Array.isArray(companiesRes.data?.data), `Retrieved ${companiesRes.data?.data?.length} company accounts`);
    const sampleCompany = companiesRes.data?.data[0];
    assert(sampleCompany?.user?.name, `Company record parsed: ${sampleCompany?.user?.name} (${sampleCompany?.activeProjects} active projects)`);

    // 7. User Suspension & Reactivation Status Toggle
    console.log('\n[Step 7]: User Status Management (Suspend & Reactivate Toggle)');
    const targetUserId = sampleTech.user._id;

    // Suspend
    const suspendRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/users/${targetUserId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'suspended' }
    );
    assert(suspendRes.status === 200 && suspendRes.data?.data?.status === 'suspended', 'User account successfully suspended');

    // Reactivate
    const reactivateRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/users/${targetUserId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'active' }
    );
    assert(reactivateRes.status === 200 && reactivateRes.data?.data?.status === 'active', 'User account successfully reactivated to active');

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runAdminAnalyticsTests();
