const http = require('http');

// Test helper function
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAuth() {
  console.log('🔍 Testing Authentication Flow...\n');

  try {
    // Test 1: Signup
    console.log('1️⃣  Testing Signup...');
    const testEmail = `user-${Date.now()}@test.com`;
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      username: `testuser${Date.now()}`,
      email: testEmail,
      password: 'TestPassword123',
      gender: 'male',
    });

    console.log(`   Status: ${signupRes.status}`);
    if (signupRes.status === 200 || signupRes.status === 201) {
      console.log('   ✅ Signup successful');
      console.log(`   User ID: ${signupRes.body.user?.id}`);
    } else {
      console.log(`   ❌ Signup failed: ${signupRes.body.error}`);
    }

    // Test 2: Login with correct password
    if (signupRes.status === 200 || signupRes.status === 201) {
      console.log('\n2️⃣  Testing Login...');
      const loginRes = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'TestPassword123',
      });

      console.log(`   Status: ${loginRes.status}`);
      if (loginRes.status === 200) {
        console.log('   ✅ Login successful');
        console.log(`   User: ${loginRes.body.user?.username}`);
      } else {
        console.log(`   ❌ Login failed: ${loginRes.body.error}`);
      }

      // Test 3: Login with wrong password
      console.log('\n3️⃣  Testing Login with Wrong Password...');
      const wrongPassRes = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'WrongPassword123',
      });

      console.log(`   Status: ${wrongPassRes.status}`);
      if (wrongPassRes.status === 401) {
        console.log('   ✅ Correctly rejected wrong password');
      } else {
        console.log(`   ❌ Should have rejected wrong password`);
      }
    }

    console.log('\n✅ Auth tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure the development server is running with: npm run dev');
  }
}

testAuth();
