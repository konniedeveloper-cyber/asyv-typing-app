const http = require('http');

// Test helper function with detailed logging
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    console.log(`📡 ${method} ${path}`);
    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
          headers: res.headers,
          duration,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(35000); // 35 second timeout

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAuthDebug() {
  console.log('🔍 Detailed Authentication Flow Testing\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Signup
    console.log('\n✅ TEST 1: User Signup');
    console.log('-'.repeat(50));
    
    const testEmail = `debug-${Date.now()}@test.com`;
    const testUsername = `debuguser${Date.now()}`;
    
    console.log(`Testing with email: ${testEmail}`);
    console.log(`Testing with username: ${testUsername}`);
    
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      username: testUsername,
      email: testEmail,
      password: 'TestPassword123!',
      gender: 'male',
    });

    console.log(`✓ Response Status: ${signupRes.status}`);
    console.log(`✓ Response Time: ${signupRes.duration}ms`);
    
    if (signupRes.status === 200) {
      console.log('✅ Signup successful');
      console.log('✓ User ID:', signupRes.body.user?.id);
      console.log('✓ Email:', signupRes.body.user?.email);
      console.log('✓ Username:', signupRes.body.user?.username);
    } else {
      console.log('❌ Signup failed');
      console.log('Error:', signupRes.body.error);
      console.log('Details:', signupRes.body.details);
      return;
    }

    // Test 2: Login with custom endpoint
    if (signupRes.status === 200) {
      console.log('\n✅ TEST 2: Custom Login Endpoint');
      console.log('-'.repeat(50));
      console.log(`Testing login for: ${testEmail}`);
      
      const loginRes = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'TestPassword123!',
      });

      console.log(`✓ Response Status: ${loginRes.status}`);
      console.log(`✓ Response Time: ${loginRes.duration}ms`);
      
      if (loginRes.status === 200) {
        console.log('✅ Custom login endpoint works');
        console.log('✓ User:', loginRes.body.user?.email);
      } else {
        console.log('❌ Custom login failed');
        console.log('Error:', loginRes.body.error);
      }

      // Test 3: NextAuth Credentials Provider
      console.log('\n✅ TEST 3: NextAuth Credentials Provider');
      console.log('-'.repeat(50));
      console.log(`Testing NextAuth callback for: ${testEmail}`);
      
      const authRes = await makeRequest('POST', '/api/auth/callback/credentials', {
        email: testEmail,
        password: 'TestPassword123!',
      });

      console.log(`✓ Response Status: ${authRes.status}`);
      console.log(`✓ Response Time: ${authRes.duration}ms`);
      
      if (authRes.status === 200 || authRes.status === 302) {
        console.log('✅ NextAuth credentials provider works');
      } else {
        console.log('⚠️  NextAuth returned:', authRes.status);
        console.log('Response:', authRes.body);
      }

      // Test 4: Login with wrong password
      console.log('\n✅ TEST 4: Wrong Password Validation');
      console.log('-'.repeat(50));
      
      const wrongPassRes = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'WrongPassword123!',
      });

      console.log(`✓ Response Status: ${wrongPassRes.status}`);
      console.log(`✓ Response Time: ${wrongPassRes.duration}ms`);
      
      if (wrongPassRes.status === 401) {
        console.log('✅ Correctly rejected wrong password');
      } else {
        console.log('⚠️  Expected 401, got:', wrongPassRes.status);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('1. Development server is running: npm run dev');
    console.log('2. MongoDB connection is active');
    console.log('3. NEXTAUTH_SECRET is set in .env');
  }
}

testAuthDebug();
