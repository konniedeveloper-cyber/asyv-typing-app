#!/usr/bin/env node

/**
 * Test Signup Flow
 * Tests the signup API endpoint directly
 */

const http = require('http');

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
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            body: parsed,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: { error: 'Could not parse response', raw: data },
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(35000);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testSignup() {
  console.log('\n🧪 Testing Signup API\n');
  console.log('Make sure dev server is running: npm run dev\n');

  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testUsername = `testuser${Date.now()}`;

    console.log('Testing with:');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Username: ${testUsername}`);
    console.log(`  Password: TestPassword123!\n`);

    const startTime = Date.now();
    const res = await makeRequest('POST', '/api/auth/signup', {
      username: testUsername,
      email: testEmail,
      password: 'TestPassword123!',
      gender: 'male',
    });
    const duration = Date.now() - startTime;

    console.log(`Response Status: ${res.status}`);
    console.log(`Response Time: ${duration}ms\n`);

    if (res.status === 200) {
      console.log('✅ Signup successful!');
      console.log('User:', res.body.user?.email);
      console.log('\nNow you can login with:');
      console.log(`  Email: ${testEmail}`);
      console.log(`  Password: TestPassword123!\n`);
    } else if (res.status === 400) {
      console.log('❌ Signup validation failed');
      console.log('Error:', res.body.error);
      console.log('Details:', res.body.details);
    } else if (res.status === 503) {
      console.log('❌ Database connection failed');
      console.log('Error:', res.body.error);
      console.log('Details:', res.body.details);
      console.log('\n💡 MongoDB might not be responding.');
      console.log('   Check: node test-mongodb-connection.js');
    } else {
      console.log('❌ Error:', res.status);
      console.log('Response:', res.body);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure dev server is running:');
    console.log('   npm run dev');
  }
}

testSignup();
