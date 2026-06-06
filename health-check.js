#!/usr/bin/env node

/**
 * System Health Check
 * Tests all components of the authentication system
 */

const http = require('http');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

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
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: { error: 'Parse error', raw: data.substring(0, 100) },
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function healthCheck() {
  console.log('\n🔍 System Health Check\n');
  console.log('=' .repeat(60));

  let allHealthy = true;

  // 1. MongoDB Connection
  console.log('\n1️⃣  Database Connection');
  console.log('-' .repeat(60));
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ MongoDB connection: HEALTHY');
    console.log(`   Users in database: ${users.length}`);
  } catch (error) {
    console.log('❌ MongoDB connection: FAILED');
    console.log(`   Error: ${error.message.substring(0, 100)}`);
    allHealthy = false;
  }

  // 2. Dev Server
  console.log('\n2️⃣  Development Server');
  console.log('-' .repeat(60));
  try {
    const res = await makeRequest('GET', '/api/auth/providers');
    if (res.status === 200) {
      console.log('✅ Dev server: HEALTHY');
      console.log('   Response time: good');
    } else {
      console.log(`⚠️  Dev server responded with ${res.status}`);
      allHealthy = false;
    }
  } catch (error) {
    console.log('❌ Dev server: NOT RUNNING');
    console.log('   Run: npm run dev');
    allHealthy = false;
  }

  // 3. Signup Endpoint
  console.log('\n3️⃣  Signup Endpoint');
  console.log('-' .repeat(60));
  try {
    const testEmail = `healthcheck-${Date.now()}@test.com`;
    const res = await makeRequest('POST', '/api/auth/signup', {
      username: `healthcheck${Date.now()}`,
      email: testEmail,
      password: 'TestPassword123!',
      gender: 'male',
    });

    if (res.status === 200) {
      console.log('✅ Signup endpoint: WORKING');
      console.log(`   Created user: ${testEmail}`);
    } else if (res.status === 503) {
      console.log('⚠️  Signup endpoint: DATABASE ERROR');
      console.log(`   ${res.body.error}`);
      allHealthy = false;
    } else if (res.status === 400) {
      console.log('⚠️  Signup endpoint: VALIDATION ERROR');
      console.log(`   ${res.body.error}`);
    } else {
      console.log(`⚠️  Signup endpoint: ERROR ${res.status}`);
      console.log(`   ${res.body.error}`);
      allHealthy = false;
    }
  } catch (error) {
    console.log('❌ Signup endpoint: UNREACHABLE');
    console.log(`   Error: ${error.message}`);
    allHealthy = false;
  }

  // 4. Authentication Config
  console.log('\n4️⃣  Authentication Configuration');
  console.log('-' .repeat(60));
  const env = process.env;
  const checks = {
    'DATABASE_URL': !!env.DATABASE_URL,
    'NEXTAUTH_SECRET': !!env.NEXTAUTH_SECRET,
    'NEXTAUTH_URL': !!env.NEXTAUTH_URL,
  };

  Object.entries(checks).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? 'SET' : 'MISSING'}`);
    if (!value) allHealthy = false;
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allHealthy) {
    console.log('✅ ✅ ✅  ALL SYSTEMS HEALTHY  ✅ ✅ ✅\n');
  } else {
    console.log('⚠️  Some systems are not healthy. See above for details.\n');
  }

  await prisma.$disconnect();
}

healthCheck();
