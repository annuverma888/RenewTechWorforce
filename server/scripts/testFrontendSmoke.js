const https = require('https');

const FRONTEND_HOST = 'renew-tech-worforce-vu14-k9p068elc.vercel.app';

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: FRONTEND_HOST,
      port: 443,
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RenewTech-QA/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${path}`));
    });
    req.end();
  });
}

async function runFrontendSmoke() {
  console.log('===============================================================');
  console.log('  RENEWTECH WORKFORCE — LIVE PRODUCTION FRONTEND SMOKE TEST   ');
  console.log(`  Target Frontend: https://${FRONTEND_HOST}                    `);
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

  try {
    // 1. Root page
    console.log('--- 1. Root Landing Page ---');
    const root = await fetchPage('/');
    assert(root.status === 200, 'GET / returns 200 OK');
    assert(root.data.includes('<div id="root"></div>'), 'HTML contains #root mounting div');
    assert(root.data.includes('RenewTech Workforce'), 'Title tag present: RenewTech Workforce');

    // Extract JS and CSS asset URLs
    const jsMatch = root.data.match(/src="(\/assets\/[^"]+\.js)"/);
    const cssMatch = root.data.match(/href="(\/assets\/[^"]+\.css)"/);

    const jsUrl = jsMatch ? jsMatch[1] : null;
    const cssUrl = cssMatch ? cssMatch[1] : null;

    console.log(`       Discovered JS Bundle:  ${jsUrl}`);
    console.log(`       Discovered CSS Bundle: ${cssUrl}`);

    // 2. Asset loading
    console.log('\n--- 2. Production Asset Loading ---');
    if (jsUrl) {
      const jsRes = await fetchPage(jsUrl);
      assert(jsRes.status === 200, `JavaScript bundle ${jsUrl} returns 200`);
      assert(jsRes.data.length > 50000, `JavaScript bundle size is substantial (${(jsRes.data.length / 1024).toFixed(1)} KB)`);
    } else {
      assert(false, 'JavaScript bundle tag detected in HTML');
    }

    if (cssUrl) {
      const cssRes = await fetchPage(cssUrl);
      assert(cssRes.status === 200, `CSS bundle ${cssUrl} returns 200`);
      assert(cssRes.data.length > 5000, `CSS bundle size is valid (${(cssRes.data.length / 1024).toFixed(1)} KB)`);
    } else {
      assert(false, 'CSS bundle link tag detected in HTML');
    }

    // 3. SPA Routing & Direct URL Refresh
    console.log('\n--- 3. Vercel SPA Routing & Deep Links (No 404) ---');
    const spaRoutes = [
      '/projects',
      '/projects/654321098765432109876543',
      '/login',
      '/register',
      '/technician/dashboard',
      '/technician/profile',
      '/technician/skill-passport',
      '/epc/dashboard',
      '/epc/projects',
      '/epc/applications',
      '/epc/workforce',
      '/admin/dashboard',
      '/admin/certificates',
      '/verify/skill-passport/654321098765432109876543',
    ];

    for (const route of spaRoutes) {
      const routeRes = await fetchPage(route);
      const isSpaHtml = routeRes.status === 200 && routeRes.data.includes('<div id="root"></div>');
      assert(isSpaHtml, `SPA route ${route} serves index.html (200 OK, no 404)`);
    }

  } catch (err) {
    console.error('[UNEXPECTED ERROR IN FRONTEND TEST]:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`  FRONTEND TEST RESULTS: Passed: ${passed} | Failed: ${failed}`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFrontendSmoke();
