const BASE_URL = 'http://127.0.0.1:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 TESTING GOOGLE AUTHENTICATION & ROLE SELECTION');
  console.log('====================================================');

  const timestamp = Date.now();
  const testGoogleUid = `firebase_uid_${timestamp}`;
  const testGoogleEmail = `solar.tech.${timestamp}@gmail.com`;
  const testGoogleName = 'Anand Verma';
  const testGooglePhoto = 'https://lh3.googleusercontent.com/a/default-user';

  let googleUserToken = null;

  try {
    // 1. New Google User Signup / Login
    console.log('\n[TEST 1] First-time Google Sign-In...');
    const googleRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: testGoogleUid,
        email: testGoogleEmail,
        name: testGoogleName,
        profilePhoto: testGooglePhoto,
      }),
    });

    const googleData = await googleRes.json();
    console.log('Response Status:', googleRes.status);
    console.log('Success:', googleData.success);
    console.log('Is New User:', googleData.isNewUser);
    console.log('Needs Role Selection:', googleData.needsRoleSelection);
    console.log('Role:', googleData.user?.role);

    if (
      googleRes.status === 201 &&
      googleData.success &&
      googleData.isNewUser === true &&
      googleData.needsRoleSelection === true &&
      googleData.user?.role === 'pending_role' &&
      googleData.token
    ) {
      console.log('✅ TEST 1 PASSED: New Google user created with pending_role and JWT token.');
      googleUserToken = googleData.token;
    } else {
      throw new Error(`TEST 1 FAILED: Unexpected response: ${JSON.stringify(googleData)}`);
    }

    // 2. Select Role (Technician)
    console.log('\n[TEST 2] Role Selection (Technician)...');
    const selectRoleRes = await fetch(`${BASE_URL}/auth/select-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleUserToken}`,
      },
      body: JSON.stringify({ role: 'technician' }),
    });

    const selectRoleData = await selectRoleRes.json();
    console.log('Response Status:', selectRoleRes.status);
    console.log('Updated Role:', selectRoleData.user?.role);
    console.log('Profile created:', !!selectRoleData.profile);
    console.log('Profile profession:', selectRoleData.profile?.profession);

    if (
      selectRoleRes.status === 200 &&
      selectRoleData.success &&
      selectRoleData.user?.role === 'technician' &&
      selectRoleData.profile
    ) {
      console.log('✅ TEST 2 PASSED: Role updated to technician and TechnicianProfile auto-initialized.');
      googleUserToken = selectRoleData.token;
    } else {
      throw new Error(`TEST 2 FAILED: Role selection failed: ${JSON.stringify(selectRoleData)}`);
    }

    // 3. Returning Google User Login
    console.log('\n[TEST 3] Returning Google User Sign-In...');
    const returnRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: testGoogleUid,
        email: testGoogleEmail,
      }),
    });

    const returnData = await returnRes.json();
    console.log('Response Status:', returnRes.status);
    console.log('Is New User:', returnData.isNewUser);
    console.log('Needs Role Selection:', returnData.needsRoleSelection);
    console.log('Existing Role:', returnData.user?.role);
    console.log('Profile attached:', !!returnData.profile);

    if (
      returnRes.status === 200 &&
      returnData.success &&
      returnData.isNewUser === false &&
      returnData.needsRoleSelection === false &&
      returnData.user?.role === 'technician' &&
      returnData.profile
    ) {
      console.log('✅ TEST 3 PASSED: Returning Google user recognized, directly routed with existing role.');
    } else {
      throw new Error(`TEST 3 FAILED: Returning user auth failed: ${JSON.stringify(returnData)}`);
    }

    // 4. Test Second User as EPC Company
    console.log('\n[TEST 4] New EPC Company Google Sign-In & Role Selection...');
    const epcUid = `epc_uid_${timestamp}`;
    const epcEmail = `sunpower.epc.${timestamp}@gmail.com`;

    const epcGoogleRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: epcUid,
        email: epcEmail,
        name: 'SunPower Developer',
      }),
    });
    const epcGoogleData = await epcGoogleRes.json();

    const epcRoleRes = await fetch(`${BASE_URL}/auth/select-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${epcGoogleData.token}`,
      },
      body: JSON.stringify({ role: 'epc_company' }),
    });
    const epcRoleData = await epcRoleRes.json();

    console.log('EPC Role:', epcRoleData.user?.role);
    console.log('Company Profile created:', !!epcRoleData.profile);
    console.log('Company Name:', epcRoleData.profile?.companyName);

    if (
      epcRoleData.user?.role === 'epc_company' &&
      epcRoleData.profile?.companyName
    ) {
      console.log('✅ TEST 4 PASSED: EPC Company role assigned and CompanyProfile created.');
    } else {
      throw new Error(`TEST 4 FAILED: EPC role selection failed: ${JSON.stringify(epcRoleData)}`);
    }

    // 5. Test Password mismatch validation on Register
    console.log('\n[TEST 5] Testing Password Mismatch Validation on Registration...');
    const mismatchRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mismatched User',
        email: `mismatch.${timestamp}@test.com`,
        password: 'Password123',
        confirmPassword: 'DifferentPassword456',
      }),
    });
    const mismatchData = await mismatchRes.json();

    if (mismatchRes.status === 400 && mismatchData.message?.includes('Passwords do not match')) {
      console.log('✅ TEST 5 PASSED: Server correctly rejected mismatched password with 400.');
    } else {
      throw new Error(`TEST 5 FAILED: Expected 400 password mismatch, got: ${mismatchRes.status}`);
    }

    // 6. Test Protected Route (/api/auth/me) with and without token
    console.log('\n[TEST 6] Testing Protected Route (/api/auth/me)...');
    const unauthRes = await fetch(`${BASE_URL}/auth/me`);
    if (unauthRes.status === 401) {
      console.log('✅ Unauthenticated request correctly rejected with 401.');
    } else {
      throw new Error(`Expected 401 for unauth request, got: ${unauthRes.status}`);
    }

    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${googleUserToken}` },
    });
    const meData = await meRes.json();

    if (meRes.status === 200 && meData.success && meData.user?.email === testGoogleEmail) {
      console.log('✅ Authenticated request returned user profile:', meData.user.email);
      console.log('✅ TEST 6 PASSED: Protected route operates securely.');
    } else {
      throw new Error(`TEST 6 FAILED: Unable to retrieve authenticated user via /auth/me.`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL GOOGLE AUTH & ROLE SELECTION TESTS PASSED!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST RUN ERROR:', err.message);
    process.exit(1);
  }
};

runTests();
