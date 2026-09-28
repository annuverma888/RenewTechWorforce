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

async function runCredentialsAndPassportTests() {
  console.log('================================================================');
  console.log('   CERTIFICATE VERIFICATION, ASSESSMENT & PASSPORT TEST SUITE   ');
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
    // 1. Health check
    console.log('[Step 1]: Server Health Check');
    const health = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200, 'Server is running and healthy on port 5000');

    // 2. Authenticate Technician
    console.log('\n[Step 2]: Authenticate Technician (rahul.kumar@gmail.com)');
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
    assert(techLogin.status === 200 && techLogin.data?.token, 'Technician logged in successfully');
    const techToken = techLogin.data?.token;
    const techUserId = techLogin.data?.user?.id;

    // 3. Authenticate Admin
    console.log('\n[Step 3]: Authenticate Admin (admin@renewtech.com)');
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
    assert(adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin', 'Admin logged in successfully');
    const adminToken = adminLogin.data?.token;

    // 4. Technician uploads a new certificate
    console.log('\n[Step 4]: Technician Uploads Renewable Energy Certificate');
    const certNumber = `SM-TEST-${Date.now()}`;
    const uploadRes = await request(
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
        certificateNumber: certNumber,
        issueDate: '2024-01-15',
        expiryDate: '2027-01-15',
        category: 'Solar',
        documentUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
      }
    );
    assert(uploadRes.status === 201 && uploadRes.data?.success, 'Certificate uploaded and queued for audit');
    const uploadedCertId = uploadRes.data?.data?._id;
    assert(uploadRes.data?.data?.status === 'Pending', 'Initial certificate status is Pending');

    // 5. Technician checks my-certificates
    console.log('\n[Step 5]: Technician Retrieves My-Certificates');
    const myCertsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/technicians/my-certificates',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(myCertsRes.status === 200 && Array.isArray(myCertsRes.data?.data), 'Retrieved technician certificate records');
    const foundCert = myCertsRes.data?.data?.find((c) => c._id === uploadedCertId);
    assert(foundCert && foundCert.certificateNumber === certNumber, 'Uploaded certificate present in technician records');

    // 6. Admin queries pending certificates
    console.log('\n[Step 6]: Admin Fetches Pending Certificates Queue');
    const adminCertsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/certificates?status=Pending',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminCertsRes.status === 200 && Array.isArray(adminCertsRes.data?.data), 'Admin successfully queried pending certificates');
    const inAdminQueue = adminCertsRes.data?.data?.find((c) => c._id === uploadedCertId);
    assert(inAdminQueue && inAdminQueue.technician?.email === 'rahul.kumar@gmail.com', 'Pending certificate visible to admin reviewer with technician details');

    // 7. Admin verifies the certificate
    console.log('\n[Step 7]: Admin Verifies Certificate (Audit Approval)');
    const verifyRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/certificates/${uploadedCertId}/verify`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        status: 'Verified',
        adminNotes: 'Government NISE portal registration number verified against national solar installer registry.',
      }
    );
    assert(verifyRes.status === 200 && verifyRes.data?.data?.status === 'Verified', 'Certificate status updated to Verified');
    assert(verifyRes.data?.data?.verifiedAt, 'VerifiedAt timestamp recorded');

    // 8. Verify updated certificate status in technician list
    console.log('\n[Step 8]: Technician Verifies Badge & Status is Updated to Verified');
    const myCertsAfterVerify = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/technicians/my-certificates',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    const verifiedCertInTech = myCertsAfterVerify.data?.data?.find((c) => c._id === uploadedCertId);
    assert(verifiedCertInTech?.status === 'Verified', 'Technician certificate now shows Verified');
    assert(verifiedCertInTech?.adminNotes?.includes('NISE'), 'Admin audit notes visible to technician');

    // 9. Skill Assessment: Get Available Assessment Modules
    console.log('\n[Step 9]: Query Available Skill Assessment Modules');
    const assessmentsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/assessments',
      method: 'GET',
    });
    assert(assessmentsRes.status === 200 && assessmentsRes.data?.data?.length > 0, `Found ${assessmentsRes.data?.data?.length} active competency modules`);
    const targetAssessment = assessmentsRes.data?.data[0];
    console.log(`  Selected module: "${targetAssessment.title}" (${targetAssessment.category})`);

    // 10. Fetch Single Assessment Details & Questions
    console.log('\n[Step 10]: Fetch Assessment Questions (Confirm Answer Obfuscation)');
    const assessmentDetail = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/assessments/${targetAssessment._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(assessmentDetail.status === 200, 'Assessment questions retrieved');
    const questions = assessmentDetail.data?.data?.questions || [];
    assert(questions.length > 0, `Assessment has ${questions.length} questions`);
    const leakedAnswers = questions.some((q) => q.correctOptionIndex !== undefined);
    assert(!leakedAnswers, 'Security check passed: correctOptionIndex is NOT exposed in examination retrieval');

    // 11. Submit Assessment Answers
    console.log('\n[Step 11]: Submit Assessment Answers and Evaluate Competency Score');
    // We will submit answers for all questions
    const answersPayload = questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: 0, // choose first option for testing
    }));

    const submitRes = await request(
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
        answers: answersPayload,
      }
    );
    assert(submitRes.status === 201 && submitRes.data?.success, 'Assessment successfully submitted and evaluated');
    const resultData = submitRes.data?.data;
    assert(typeof resultData?.result?.scorePercentage === 'number', `Score calculated: ${resultData?.result?.scorePercentage}%`);
    assert(resultData?.skillLevel, `Skill level assigned: ${resultData?.skillLevel}`);
    assert(Array.isArray(resultData?.categoryBreakdown) && resultData?.categoryBreakdown.length > 0, 'Domain category breakdown evaluated');

    // 12. Retrieve Technician's Assessment History
    console.log('\n[Step 12]: Retrieve Completed Assessment Results for Technician');
    const myResultsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/assessments/my-results',
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(myResultsRes.status === 200 && myResultsRes.data?.data?.length > 0, 'Assessment attempt saved in history');

    // 13. Digital Skill Passport Generation
    console.log('\n[Step 13]: Generate Digital Skill Passport for Technician');
    const passportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${techUserId}/passport`,
      method: 'GET',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    assert(passportRes.status === 200 && passportRes.data?.success, 'Digital Skill Passport generated successfully');
    const passport = passportRes.data?.data;

    assert(passport?.passportId && passport.passportId.startsWith('RT-PASS-'), `Unique Passport ID generated: ${passport?.passportId}`);
    assert(passport?.technician?.name === 'Rahul Kumar', 'Passport bears technician legal identity');
    assert(typeof passport?.scores?.overallSkillScore === 'number', `Passport overall skill score: ${passport?.scores?.overallSkillScore}%`);
    assert(Array.isArray(passport?.verifiedCertificates), 'Verified certificates section present');
    const hasOurCert = passport?.verifiedCertificates?.some((c) => c.certificateNumber === certNumber);
    assert(hasOurCert, 'Newly admin-verified certificate is stamped on the Digital Skill Passport');
    assert(Array.isArray(passport?.assessmentsTaken) && passport.assessmentsTaken.length > 0, 'Completed assessment is recorded on the Skill Passport');
    assert(passport?.ratingBreakdown && passport.ratingBreakdown.safety, '5-factor contractor ratings breakdown present');
    assert(passport?.verificationSeal, `Digital authority seal present: "${passport?.verificationSeal}"`);

    // 14. Public Verification Link Check (Without Auth Token)
    console.log('\n[Step 14]: Test Public Verification (Simulate EPC QR Scan)');
    const publicPassportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${techUserId}/passport`,
      method: 'GET',
    });
    assert(publicPassportRes.status === 200 && publicPassportRes.data?.success, 'Public QR verification endpoint accessible without authentication credentials');
    assert(publicPassportRes.data?.data?.passportId === passport.passportId, 'Public view displays matching cryptographic passport ID');

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

runCredentialsAndPassportTests();
