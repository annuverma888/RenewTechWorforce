const mongoose = require('mongoose');
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');

const API_BASE = 'http://127.0.0.1:5000/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 RUNNING EPC LOCATION FIX VERIFICATION SUITE');
  console.log('=====================================================\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/renewtech');
  console.log('✓ Connected to MongoDB (renewtech)\n');

  let passed = 0;
  let total = 7;

  try {
    // ----------------------------------------------------
    // TEST A: New EPC Account without Location
    // ----------------------------------------------------
    console.log('--- TEST A: Register New EPC Account without entering location ---');
    const timestamp = Date.now();
    const testAEmail = `epc.testA.${timestamp}@renewtechtest.com`;
    const regRes = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alpha CleanTech EPC',
        email: testAEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'epc_company',
      }),
    });

    const tokenA = regRes.data.token;
    const profileA = regRes.data.profile;

    const cityA = profileA?.city || '';
    const stateA = profileA?.state || '';
    const locA = [cityA, stateA].filter(Boolean).join(', ');
    const displayA = locA || 'Location not added';

    if (displayA === 'Location not added' && cityA === '' && stateA === '') {
      console.log(`✅ TEST A PASSED: New EPC created. Location is empty ("${displayA}"). No default Noida/UP.`);
      passed++;
    } else {
      throw new Error(`TEST A FAILED: Expected 'Location not added', but received city="${cityA}", state="${stateA}"`);
    }

    // ----------------------------------------------------
    // TEST B: Enter Location -> "Noida, Uttar Pradesh"
    // ----------------------------------------------------
    console.log('\n--- TEST B: User explicitly saves location "Noida, Uttar Pradesh" ---');
    const updateBRes = await request(`${API_BASE}/auth/company-profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        city: 'Noida',
        state: 'Uttar Pradesh',
        officeAddress: 'Expressway Tower, Sector 132',
      }),
    });

    const profileB = updateBRes.data.profile;
    const locB = [profileB?.city, profileB?.state].filter(Boolean).join(', ');

    if (locB === 'Noida, Uttar Pradesh') {
      console.log(`✅ TEST B PASSED: Saved location is now "${locB}".`);
      passed++;
    } else {
      throw new Error(`TEST B FAILED: Expected "Noida, Uttar Pradesh", received "${locB}"`);
    }

    // ----------------------------------------------------
    // TEST C: Change Location -> "Jaipur, Rajasthan"
    // ----------------------------------------------------
    console.log('\n--- TEST C: User edits location to "Jaipur, Rajasthan" ---');
    const updateCRes = await request(`${API_BASE}/auth/company-profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        city: 'Jaipur',
        state: 'Rajasthan',
      }),
    });

    const profileC = updateCRes.data.profile;
    const locC = [profileC?.city, profileC?.state].filter(Boolean).join(', ');

    if (locC === 'Jaipur, Rajasthan') {
      console.log(`✅ TEST C PASSED: Updated location is now "${locC}".`);
      passed++;
    } else {
      throw new Error(`TEST C FAILED: Expected "Jaipur, Rajasthan", received "${locC}"`);
    }

    // ----------------------------------------------------
    // TEST D: Refresh Page (calls /auth/me)
    // ----------------------------------------------------
    console.log('\n--- TEST D: Refresh Page Simulation (GET /api/auth/me) ---');
    const getMeRes = await request(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const refreshedProfile = getMeRes.data.profile;
    const refreshedLoc = [refreshedProfile?.city, refreshedProfile?.state].filter(Boolean).join(', ');

    if (refreshedLoc === 'Jaipur, Rajasthan') {
      console.log(`✅ TEST D PASSED: Refreshed profile retained saved location "${refreshedLoc}".`);
      passed++;
    } else {
      throw new Error(`TEST D FAILED: Expected "Jaipur, Rajasthan" on refresh, received "${refreshedLoc}"`);
    }

    // ----------------------------------------------------
    // TEST E: Logout and Login again
    // ----------------------------------------------------
    console.log('\n--- TEST E: Logout and Re-Login ---');
    const loginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testAEmail,
        password: 'Password@123',
      }),
    });

    const loginProfile = loginRes.data.profile;
    const loginLoc = [loginProfile?.city, loginProfile?.state].filter(Boolean).join(', ');

    if (loginLoc === 'Jaipur, Rajasthan') {
      console.log(`✅ TEST E PASSED: Login response returns user-entered location "${loginLoc}".`);
      passed++;
    } else {
      throw new Error(`TEST E FAILED: Expected "Jaipur, Rajasthan" after re-login, received "${loginLoc}"`);
    }

    // ----------------------------------------------------
    // TEST F: Google Auth Flow without company location
    // ----------------------------------------------------
    console.log('\n--- TEST F: Google Auth Flow for brand new user ---');
    const googleUid = `google-test-${timestamp}`;
    const googleEmail = `google.epc.${timestamp}@gmail.com`;

    // 1. Google sign in
    const googleAuthRes = await request(`${API_BASE}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({
        firebaseUid: googleUid,
        email: googleEmail,
        name: 'Google Renewable Partner',
        profilePhoto: 'https://example.com/photo.jpg',
      }),
    });

    const googleToken = googleAuthRes.data.token;

    // 2. Select role as epc_company
    const selectRoleRes = await request(`${API_BASE}/auth/select-role`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleToken}` },
      body: JSON.stringify({ role: 'epc_company' }),
    });

    const googleProfile = selectRoleRes.data.profile;
    const googleCity = googleProfile?.city || '';
    const googleState = googleProfile?.state || '';
    const googleLoc = [googleCity, googleState].filter(Boolean).join(', ');
    const googleDisplay = googleLoc || 'Location not added';

    if (googleDisplay === 'Location not added' && googleCity === '' && googleState === '') {
      console.log(`✅ TEST F PASSED: Google user created & selected EPC role. Location is empty ("${googleDisplay}"). No automatic city/state.`);
      passed++;
    } else {
      throw new Error(`TEST F FAILED: Google user received automatic location: "${googleLoc}"`);
    }

    // ----------------------------------------------------
    // TEST G: Direct Database Verification
    // ----------------------------------------------------
    console.log('\n--- TEST G: Direct MongoDB Verification ---');
    const dbGoogleUser = await User.findOne({ email: googleEmail });
    const dbGoogleProfile = await CompanyProfile.findOne({ user: dbGoogleUser._id });

    console.log('Direct DB Check on Google EPC Profile:', {
      user: dbGoogleUser.email,
      companyName: dbGoogleProfile.companyName,
      city: dbGoogleProfile.city,
      state: dbGoogleProfile.state,
    });

    if (dbGoogleProfile.city === '' && dbGoogleProfile.state === '') {
      console.log('✅ TEST G PASSED: Database record confirms city="" and state="". No automatic "Noida" or "Uttar Pradesh" stored in MongoDB.');
      passed++;
    } else {
      throw new Error(`TEST G FAILED: DB has city="${dbGoogleProfile.city}", state="${dbGoogleProfile.state}"`);
    }

    console.log('\n=====================================================');
    console.log(`🎉 ALL ${passed}/${total} TESTS PASSED SUCCESSFULLY!`);
    console.log('=====================================================');
  } catch (err) {
    console.error('\n❌ TEST SUITE ERROR:', err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

runTests();
