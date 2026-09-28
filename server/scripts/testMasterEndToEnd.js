const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const opts = { ...options };
    opts.headers = { ...(opts.headers || {}) };
    let bodyData = null;
    if (data) {
      bodyData = typeof data === 'string' ? data : JSON.stringify(data);
      opts.headers['Content-Length'] = Buffer.byteLength(bodyData);
      if (!opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/json';
      }
    }
    const req = http.request(opts, (res) => {
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

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runMasterEndToEndTest() {
  console.log('================================================================');
  console.log('       RENEWTECH WORKFORCE - MASTER END-TO-END TEST SUITE       ');
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
    // -------------------------------------------------------------
    // PHASE 1: SYSTEM HEALTH & PUBLIC VISITOR EXPLORATION
    // -------------------------------------------------------------
    console.log('----------------------------------------------------------------');
    console.log('PHASE 1: SYSTEM HEALTH & PUBLIC VISITOR EXPLORATION');
    console.log('----------------------------------------------------------------');

    const rootRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/',
      method: 'GET',
    });
    assert(rootRes.status === 200 && rootRes.data?.status === 'healthy', '1.0 System API Root Check returns healthy');

    const health = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && (health.data?.status === 'healthy' || health.data?.status === 'online'), '1.1 System API Health Check returns healthy/online');

    const publicProjects = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/projects?projectType=Solar',
      method: 'GET',
    });
    assert(publicProjects.status === 200 && publicProjects.data?.count >= 0, `1.2 Public Projects Directory accessible (${publicProjects.data?.count} Solar projects)`);

    const publicTechs = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/technicians?location=Gujarat',
      method: 'GET',
    });
    assert(publicTechs.status === 200 && Array.isArray(publicTechs.data?.data), '1.3 Public Technician Directory accessible with location query');

    const publicAssessments = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/assessments',
      method: 'GET',
    });
    assert(publicAssessments.status === 200 && publicAssessments.data?.count > 0, '1.4 Public Competency Assessment Catalog accessible');

    // -------------------------------------------------------------
    // PHASE 2: AUTHENTICATION, REGISTRATION & RBAC GUARDS
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 2: AUTHENTICATION, REGISTRATION & RBAC GUARDS');
    console.log('----------------------------------------------------------------');

    const testSuffix = Date.now();
    const newTechEmail = `tech.e2e.${testSuffix}@renewtech.com`;
    const newEpcEmail = `epc.e2e.${testSuffix}@renewtech.com`;

    // 2.1 Register New Technician
    const techReg = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Arjun Verma',
        email: newTechEmail,
        phone: '+91 98765 43210',
        password: 'Password@123',
        role: 'technician',
        profession: 'Certified Solar PV Wireman',
        city: 'Ahmedabad',
        state: 'Gujarat',
      }
    );
    assert(techReg.status === 201 && techReg.data?.token, `2.1 Technician registered: ${newTechEmail}`);
    const techToken = techReg.data?.token;
    const techUserId = techReg.data?.user?.id;

    // 2.2 Register New EPC Company
    const epcReg = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Solaris Energy EPC',
        email: newEpcEmail,
        phone: '+91 91234 56789',
        password: 'Password@123',
        role: 'epc_company',
        companyName: 'Solaris CleanTech Infrastructure Pvt Ltd',
        city: 'Jaipur',
        state: 'Rajasthan',
      }
    );
    assert(epcReg.status === 201 && epcReg.data?.token, `2.2 EPC Company registered: ${newEpcEmail}`);
    const epcToken = epcReg.data?.token;

    // 2.3 Authenticate Admin
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
    assert(adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin', '2.3 Admin authenticated successfully');
    const adminToken = adminLogin.data?.token;

    // 2.4 Verify RBAC Forbidden Guards
    const rbacViolation = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/statistics',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(rbacViolation.status === 403, '2.4 RBAC Security Check: Technician blocked from Admin API (403)');

    // -------------------------------------------------------------
    // PHASE 3: TECHNICIAN WORKFLOW & CERTIFICATE UPLOAD
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 3: TECHNICIAN PROFILE, CERTIFICATES & SKILL ASSESSMENTS');
    console.log('----------------------------------------------------------------');

    // 3.1 Update Profile
    const updateProfileRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/technicians/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
      },
      {
        yearsOfExperience: 4,
        expectedDailyRate: 2100,
        bio: 'Specialized in utility-scale rooftop and ground-mounted solar electrical balance of plant.',
        renewableSkills: [
          { name: 'PV Installation', category: 'Solar', proficiency: 'Expert', isVerified: true },
          { name: 'PV Wiring', category: 'Solar', proficiency: 'Advanced', isVerified: true },
          { name: 'Inverter Installation', category: 'Solar', proficiency: 'Advanced', isVerified: true },
          { name: 'Electrical Safety', category: 'Other', proficiency: 'Advanced', isVerified: true },
        ],
      }
    );
    assert(updateProfileRes.status === 200 && updateProfileRes.data?.data?.expectedDailyRate === 2100, '3.1 Technician updated profile and renewable skills');

    // 3.2 Update Availability
    const availRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/technicians/availability',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
      },
      { availability: 'Available' }
    );
    assert(availRes.status === 200 && availRes.data?.data?.currentAvailability === 'Available', '3.2 Technician availability toggled to Available');

    // 3.3 Upload Certificate
    const certNum = `NISE-E2E-${Date.now()}`;
    const certUploadRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/technicians/certificates',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
      },
      {
        certificateName: 'Suryamitra Solar PV Installer (Level 4)',
        issuingOrganization: 'National Institute of Solar Energy (NISE)',
        certificateNumber: certNum,
        issueDate: '2024-02-10',
        category: 'Solar',
        documentUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
      }
    );
    assert(certUploadRes.status === 201 && certUploadRes.data?.data?.status === 'Pending', `3.3 Certificate uploaded (${certNum}) with Pending status`);
    const certId = certUploadRes.data?.data?._id;

    // 3.4 Admin verifies the certificate
    const adminVerifyRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/certificates/${certId}/verify`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        status: 'Verified',
        adminNotes: 'Accreditation verified against NISE national installer portal registry.',
      }
    );
    assert(adminVerifyRes.status === 200 && adminVerifyRes.data?.data?.status === 'Verified', '3.4 Admin audited and marked certificate as Verified');

    // 3.5 Take Competency Assessment
    const targetAssessment = publicAssessments.data?.data[0];
    const assessSubmitRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/assessments/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
      },
      {
        assessmentId: targetAssessment._id,
        answers: (targetAssessment.questions || []).map((q) => ({
          questionId: q._id,
          selectedOptionIndex: 0,
        })),
      }
    );
    assert(assessSubmitRes.status === 201 && assessSubmitRes.data?.success, '3.5 Assessment submitted, evaluated, and scored');

    // -------------------------------------------------------------
    // PHASE 4: EPC PROJECT POSTING & SMART AI MATCHING
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 4: EPC PROJECT POSTING & SMART AI MATCHING');
    console.log('----------------------------------------------------------------');

    // 4.1 Post Project
    const postProjRes = await request(
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
        projectName: `Utility Solar Grid Phase-${Date.now()}`,
        projectType: 'Solar',
        description: 'Complete DC wiring, string inverter commissioning, and grid synchronization.',
        location: {
          city: 'Ahmedabad',
          state: 'Gujarat',
          address: 'Renewable Power Park, Sector 4',
        },
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        durationDays: 30,
        numberWorkers: 5,
        requiredSkills: ['PV Installation', 'PV Wiring', 'Inverter Installation'],
        requiredCertifications: ['Solar PV Installer'],
        minimumExperience: 2,
        budget: 650000,
      }
    );
    assert(postProjRes.status === 201 && postProjRes.data?.data?._id, '4.1 EPC Company posted new Solar project');
    const createdProject = postProjRes.data?.data;
    const projectId = createdProject._id;

    // 4.2 Query Smart Matching Engine
    const matchRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/matching/project/${projectId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(matchRes.status === 200 && matchRes.data?.data?.length > 0, `4.2 Smart Matching Engine evaluated ${matchRes.data?.data?.length} technicians`);
    const ourCandidate = matchRes.data?.data?.find((m) => m.technician.id === techUserId);
    assert(ourCandidate && ourCandidate.matchScore >= 80, `4.3 Verified high match score for candidate: ${ourCandidate?.matchScore}%`);
    assert(ourCandidate?.breakdown && ourCandidate?.breakdown?.reasons?.length > 0, '4.4 Explainable matching narrative generated with factor breakdowns');

    // -------------------------------------------------------------
    // PHASE 5: APPLICATIONS, RECRUITMENT & WORKFORCE DEPLOYMENT
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 5: APPLICATIONS, RECRUITMENT & WORKFORCE DEPLOYMENT');
    console.log('----------------------------------------------------------------');

    // 5.1 Technician applies to project
    const applyRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/applications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
      },
      {
        projectId,
        coverNote: 'Ready with complete certified toolkit and valid Suryamitra credential.',
      }
    );
    assert(applyRes.status === 201 && applyRes.data?.data?._id, '5.1 Technician submitted application with calculated match score');
    const appId = applyRes.data?.data?._id;

    // 5.2 EPC Company Shortlists
    const shortlistRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/applications/${appId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      { status: 'Shortlisted' }
    );
    assert(shortlistRes.status === 200 && shortlistRes.data?.data?.status === 'Shortlisted', '5.2 Application moved to Shortlisted');

    // 5.3 EPC Company Hires and Deploys Candidate
    const hireRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/applications/${appId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        status: 'Hired',
        roleAssigned: 'Lead Solar PV Technician',
        dailyRateAgreed: 2100,
      }
    );
    assert(hireRes.status === 200 && hireRes.data?.data?.status === 'Hired', '5.3 Application status updated to Hired');

    // 5.4 Verify Workforce Roster Auto-Assignment
    const rosterRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/workforce/project/${projectId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    const assignedWorker = rosterRes.data?.data?.find((w) => w.technician?._id === techUserId);
    assert(assignedWorker && assignedWorker.roleAssigned === 'Lead Solar PV Technician', '5.4 Technician automatically assigned to Project Workforce Roster');
    const assignmentId = assignedWorker?._id;

    // 5.5 Update Attendance & Shifts
    const attendRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/workforce/${assignmentId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        attendance: 'Present',
        workStatus: 'On Schedule',
        totalDaysWorked: 10,
      }
    );
    assert(attendRes.status === 200 && attendRes.data?.data?.totalDaysWorked === 10, '5.5 Attendance and shifts logged on workforce roster');

    // 5.6 Complete Project & Submit Performance Review
    const completeProjRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/workforce/project/${projectId}/progress`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      { progressPercentage: 100, projectStatus: 'Completed' }
    );
    assert(completeProjRes.status === 200 && completeProjRes.data?.data?.projectStatus === 'Completed', '5.6 Project progress reached 100% (Completed)');

    const reviewRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        projectId,
        technicianId: techUserId,
        technicalSkill: 5,
        safety: 5,
        punctuality: 5,
        qualityOfWork: 5,
        overallRating: 5,
        feedbackComment: 'Flawless electrical wiring and safety compliance throughout solar commissioning.',
      }
    );
    assert(reviewRes.status === 201 && reviewRes.data?.data?.overallRating === 5, '5.7 5-Factor contractor review and performance ratings recorded');

    // -------------------------------------------------------------
    // PHASE 6: DIGITAL SKILL PASSPORT & PUBLIC VERIFICATION
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 6: DIGITAL SKILL PASSPORT & PUBLIC VERIFICATION');
    console.log('----------------------------------------------------------------');

    // 6.1 Private Passport Retrieval
    const passportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${techUserId}/passport`,
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(passportRes.status === 200 && passportRes.data?.success, '6.1 Digital Skill Passport generated');
    const passport = passportRes.data?.data;
    assert(passport?.passportId && passport.passportId.startsWith('RT-PASS-'), `6.2 Cryptographic Passport ID: ${passport?.passportId}`);
    assert(passport?.verifiedCertificates?.length > 0, `6.3 Verified certificates stamped: ${passport?.verifiedCertificates?.length}`);
    assert(passport?.ratingBreakdown?.overall === 5, '6.4 5-Factor ratings updated on Skill Passport: 5.0/5.0');

    // 6.2 Public QR Verification (No Auth Header)
    const publicPassportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${techUserId}/passport`,
      method: 'GET',
    });
    assert(publicPassportRes.status === 200 && publicPassportRes.data?.data?.passportId === passport.passportId, '6.5 Public external QR verification accessible without session');

    // -------------------------------------------------------------
    // PHASE 7: ADMIN DASHBOARD & PLATFORM ANALYTICS
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 7: ADMIN DASHBOARD & PLATFORM ANALYTICS');
    console.log('----------------------------------------------------------------');

    // 7.1 Admin Analytics
    const adminAnalyticsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAnalyticsRes.status === 200 && adminAnalyticsRes.data?.success, '7.1 In-depth Platform Analytics endpoint online');
    const anData = adminAnalyticsRes.data?.data;
    assert(anData?.monthlyGrowth?.length === 6, '7.2 6-Month historical growth timeline verified');
    assert(anData?.skillsGapAnalysis?.length > 0, '7.3 Clean energy skills demand vs supply gap intelligence computed');
    assert(anData?.recentActivityStream?.length > 0, '7.4 Real-time platform activity stream aggregated');

    // 7.2 Admin User Management (Suspend & Reactivate)
    const suspendRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/users/${techUserId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'suspended' }
    );
    assert(suspendRes.status === 200 && suspendRes.data?.data?.status === 'suspended', '7.5 User account successfully suspended by admin');

    // Test suspended user cannot login
    const blockedLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: newTechEmail, password: 'Password@123' }
    );
    assert(blockedLogin.status === 403, '7.6 Suspended user rejected at login with HTTP 403 Forbidden');

    // Reactivate user
    const reactivateRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/users/${techUserId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'active' }
    );
    assert(reactivateRes.status === 200 && reactivateRes.data?.data?.status === 'active', '7.7 User account reactivated to active');

    // -------------------------------------------------------------
    // PHASE 8: NOTIFICATIONS DISPATCH & READ STATUS
    // -------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('PHASE 8: NOTIFICATIONS DISPATCH & READ STATUS');
    console.log('----------------------------------------------------------------');

    const notifsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(notifsRes.status === 200 && notifsRes.data?.count > 0, `8.1 Notifications dispatched to technician (${notifsRes.data?.count} in-app messages)`);

    const markAllRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/notifications/read-all',
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(markAllRes.status === 200, '8.2 Notifications marked as read');

    console.log('\n================================================================');
    console.log(`MASTER END-TO-END SUITE RESULT: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Master Test Suite Execution Failure:', error);
    process.exit(1);
  }
}

runMasterEndToEndTest();
