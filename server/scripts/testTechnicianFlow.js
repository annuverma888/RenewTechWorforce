const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
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

async function testTechnicianFlow() {
  console.log('====================================================');
  console.log('   TECHNICIAN DASHBOARD & APIS VERIFICATION SUITE   ');
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
    // 1. Login as Rahul Kumar
    console.log('[Step 1]: Authenticate Technician');
    const loginRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'rahul.kumar@gmail.com', password: 'Tech@123' }
    );
    assert(loginRes.status === 200 && loginRes.data?.token, 'Technician authenticated successfully');
    const token = loginRes.data?.token;
    const userId = loginRes.data?.user?.id;

    // 2. Fetch Profile session
    console.log('\n[Step 2]: Fetch Technician Profile');
    const meRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(meRes.status === 200 && meRes.data?.profile?.profession, 'Profile loaded: ' + meRes.data?.profile?.profession);
    assert(meRes.data?.profile?.renewableSkills?.length >= 3, 'Renewable skills array populated');

    // 3. Update Availability Toggle
    console.log('\n[Step 3]: Toggle Availability Status');
    const availRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/technicians/availability',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { availability: 'Available' }
    );
    assert(availRes.status === 200 && availRes.data?.data?.currentAvailability === 'Available', 'Availability toggled to Available');

    // 4. Update Profile & Add Skill
    console.log('\n[Step 4]: Update Profile & Skill Proficiencies');
    const currentSkills = meRes.data?.profile?.renewableSkills || [];
    const updateRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/technicians/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        expectedDailyRate: 1950,
        expectedMonthlyRate: 46000,
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        renewableSkills: [
          ...currentSkills,
          { name: 'Site Survey', category: 'Solar', proficiency: 'Advanced' },
        ],
      }
    );
    assert(updateRes.status === 200 && updateRes.data?.data?.expectedDailyRate === 1950, 'Daily rate updated to ₹1,950');

    // 5. Upload New Certificate
    console.log('\n[Step 5]: Upload Renewable Certificate');
    const certNum = `NSDC-TEST-${Date.now()}`;
    const certRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/technicians/certificates',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        certificateName: 'Solar Grid Interconnection Specialist',
        issuingOrganization: 'National Institute of Solar Energy (NISE)',
        certificateNumber: certNum,
        issueDate: '2023-08-10',
        category: 'Solar',
      }
    );
    assert(certRes.status === 201 && certRes.data?.data?.status === 'Pending', 'Certificate uploaded with Pending status');

    // 6. Fetch My Certificates
    console.log('\n[Step 6]: Retrieve My Certificates Vault');
    const myCertsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/technicians/my-certificates',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(myCertsRes.status === 200 && myCertsRes.data?.count >= 3, `Certificates vault retrieved: ${myCertsRes.data?.count} certificates`);

    // 7. Get Recommended Projects (Smart Matching)
    console.log('\n[Step 7]: Smart AI Recommended Projects');
    const recRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/matching/technician/recommended',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(recRes.status === 200 && recRes.data?.count > 0, `Smart matching returned ${recRes.data?.count} projects`);
    const topProj = recRes.data?.data?.[0];
    assert(topProj.matchScore > 70, `Top recommended project achieved ${topProj.matchScore}% Match Score`);
    assert(topProj.breakdown?.reasons?.length > 0, `Matching rationale: ${topProj.breakdown?.reasons?.[0]}`);

    // 8. Submit Competency Assessment
    console.log('\n[Step 8]: Submit Skill Competency Assessment');
    const assessList = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/assessments',
      method: 'GET',
    });
    const solarTest = assessList.data?.data?.find((a) => a.category === 'Solar');

    // Fetch questions to answer
    const questionsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/assessments/${solarTest._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const answers = (questionsRes.data?.data?.questions || []).map((q) => ({
      questionId: q._id,
      selectedOptionIndex: 1, // pick answer
    }));

    const submitRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/assessments/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        assessmentId: solarTest._id,
        answers,
      }
    );
    assert(submitRes.status === 201 && submitRes.data?.data?.result?.scorePercentage !== undefined, 'Assessment evaluated and scored');
    assert(submitRes.data?.data?.categoryBreakdown?.length > 0, 'Domain category breakdown computed');

    // 9. Fetch Digital Skill Passport
    console.log('\n[Step 9]: Fetch Updated Digital Skill Passport');
    const passportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${userId}/passport`,
      method: 'GET',
    });
    assert(passportRes.status === 200 && passportRes.data?.data?.passportId, `Passport generated with ID: ${passportRes.data?.data?.passportId}`);
    assert(passportRes.data?.data?.scores?.overallSkillScore > 0, `Overall Skill Score: ${passportRes.data?.data?.scores?.overallSkillScore}%`);
    assert(passportRes.data?.data?.ratingBreakdown?.overall !== undefined, `Verified Rating: ${passportRes.data?.data?.ratingBreakdown?.overall}/5`);

    console.log('\n====================================================');
    console.log(`TECHNICIAN FLOW TEST: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Technician test exception:', error);
    process.exit(1);
  }
}

testTechnicianFlow();
