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

async function runWorkforceFlowTests() {
  console.log('================================================================');
  console.log('   APPLICATIONS, SHORTLISTING, HIRING & WORKFORCE FLOW TESTS   ');
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
    // 1. Log in Technician (Amit Patel)
    console.log('[Step 1]: Authenticate Technician (amit.patel@gmail.com)');
    const techLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'amit.sharma@gmail.com', password: 'Tech@123' }
    );
    assert(techLogin.status === 200 && techLogin.data?.token, 'Technician logged in successfully');
    const techToken = techLogin.data?.token;
    const techUserId = techLogin.data?.user?.id;

    // 2. Log in EPC Company (contact@greenvolt.in)
    console.log('\n[Step 2]: Authenticate EPC Company (contact@greenvolt.in)');
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
    assert(epcLogin.status === 200 && epcLogin.data?.token, 'EPC company logged in successfully');
    const epcToken = epcLogin.data?.token;

    // 3. Post a fresh open Project by EPC
    console.log('\n[Step 3]: EPC creates a new Solar Commissioning project');
    const newProj = await request(
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
        projectName: 'Gujarat 25MW High-Yield Solar Array Phase 2',
        projectType: 'Solar',
        description: 'Comprehensive DC stringing, module mounting, and inverter commissioning for utility scale array.',
        location: {
          siteName: 'Charanka Solar Park Phase 2',
          city: 'Patan',
          state: 'Gujarat',
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        durationDays: 45,
        numberWorkers: 4,
        budget: 450000,
        minimumExperience: 2,
        requiredSkills: ['PV Installation', 'PV Wiring', 'Inverter Installation'],
        requiredCertifications: ['Suryamitra Certified Solar PV Installer'],
      }
    );
    assert(newProj.status === 201 && newProj.data?.data?._id, 'Project created successfully');
    const projectId = newProj.data?.data?._id;

    // 4. Technician applies to the Project
    console.log('\n[Step 4]: Technician submits application to the Project');
    const appRes = await request(
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
        projectId: projectId,
        coverNote: 'Certified Suryamitra technician with 3 years hands-on utility-scale installation experience in Gujarat.',
      }
    );
    assert(appRes.status === 201 && appRes.data?.data?._id, 'Application created with calculated match score');
    const applicationId = appRes.data?.data?._id;
    const matchScore = appRes.data?.data?.matchScore;
    assert(typeof matchScore === 'number' && matchScore > 0, `Application has match score: ${matchScore}%`);

    // 5. EPC views applications list
    console.log('\n[Step 5]: EPC reviews incoming applications for the project');
    const appsList = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/applications?projectId=${projectId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(appsList.status === 200 && appsList.data?.data?.length > 0, 'EPC retrieved applications list');
    assert(appsList.data?.data?.[0]?.status === 'Applied', 'Initial status is "Applied"');

    // 6. EPC Shortlists Candidate
    console.log('\n[Step 6]: EPC shortlists candidate');
    const shortlistRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/applications/${applicationId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        status: 'Shortlisted',
        note: 'Candidate meets high skill and location criteria.',
      }
    );
    assert(shortlistRes.status === 200 && shortlistRes.data?.data?.status === 'Shortlisted', 'Application successfully Shortlisted');

    // 7. EPC schedules / moves candidate to Interviewing
    console.log('\n[Step 7]: EPC invites candidate for interview');
    const interviewRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/applications/${applicationId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        status: 'Interviewing',
        note: 'Site Engineer interview scheduled via phone/video conference.',
      }
    );
    assert(interviewRes.status === 200 && interviewRes.data?.data?.status === 'Interviewing', 'Application status moved to "Interviewing"');

    // 8. EPC Hires and Deploys Technician to Workforce
    console.log('\n[Step 8]: EPC Hires candidate and assigns to Workforce Roster');
    const hireRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/applications/${applicationId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        status: 'Hired',
        roleAssigned: 'Inverter Commissioning Tech',
        dailyRateAgreed: 2200,
        note: 'Hired with daily wage ₹2,200/day. Report to Charanka site office at 8:30 AM.',
      }
    );
    assert(hireRes.status === 200 && hireRes.data?.data?.status === 'Hired', 'Candidate marked as "Hired"');

    // 9. Verify Workforce Assignment automatically created
    console.log('\n[Step 9]: Verify automated WorkforceAssignment and Project Crew counter');
    const wfList = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/workforce/project/${projectId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${epcToken}` },
    });
    assert(wfList.status === 200 && wfList.data?.data?.length === 1, 'Technician actively assigned in project workforce');
    const assignment = wfList.data?.data?.[0];
    assert(assignment.roleAssigned === 'Inverter Commissioning Tech', 'Correct role assigned');
    assert(assignment.dailyRateAgreed === 2200, 'Agreed daily rate is ₹2,200');
    assert(wfList.data?.project?.hiredWorkersCount === 1, 'Project hiredWorkersCount incremented to 1');

    // 10. Update Attendance and Shift Logging
    console.log('\n[Step 10]: EPC updates attendance and logs days worked');
    const updateWf = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/workforce/${assignment._id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${epcToken}`,
        },
      },
      {
        attendance: 'Present',
        workStatus: 'On Schedule',
        totalDaysWorked: 5,
        notes: 'Punctual and verified DC polarity on 12 strings without rework.',
      }
    );
    assert(updateWf.status === 200 && updateWf.data?.data?.totalDaysWorked === 5, 'Attendance marked Present and 5 shifts logged');

    // 11. EPC submits 5-factor Performance Review
    console.log('\n[Step 11]: EPC records performance review to Skill Passport');
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
        technicianId: techUserId,
        projectId: projectId,
        overallRating: 5,
        technicalSkill: 5,
        safety: 5,
        punctuality: 4,
        qualityOfWork: 5,
        feedbackComment: 'Outstanding inverter commissioning and DC wiring standards. Highly recommended for utility projects.',
      }
    );
    assert(reviewRes.status === 201 && reviewRes.data?.data?._id, 'Performance review recorded successfully');

    // 12. Verify Technician's Digital Skill Passport reflects the review
    console.log('\n[Step 12]: Verify Technician Digital Skill Passport reflects rating');
    const passportRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/technicians/${techUserId}/passport`,
      method: 'GET',
    });
    assert(passportRes.status === 200 && passportRes.data?.data?.passportId, 'Digital Skill Passport retrieved');
    assert(passportRes.data?.data?.ratingBreakdown?.overall > 0, `Average rating updated: ${passportRes.data?.data?.ratingBreakdown?.overall}/5`);
    assert(passportRes.data?.data?.reviewsCount >= 1, `Review count recorded: ${passportRes.data?.data?.reviewsCount}`);

    console.log('\n================================================================');
    console.log(`WORKFORCE FLOW TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runWorkforceFlowTests();
