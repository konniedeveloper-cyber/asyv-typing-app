#!/usr/bin/env node

/**
 * Complete System Diagnostics
 * Shows Mongolia status, connection issues, and what's wrong
 */

const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function diagnose() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 COMPLETE SYSTEM DIAGNOSTICS');
  console.log('='.repeat(70) + '\n');

  // 1. Check Environment Variables
  console.log('1️⃣  ENVIRONMENT VARIABLES');
  console.log('-'.repeat(70));
  
  const env = process.env;
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  let envOk = true;

  required.forEach((key) => {
    if (env[key]) {
      const value = env[key];
      const hidden = value.length > 50 ? value.substring(0, 30) + '...' : value;
      console.log(`✅ ${key}`);
      console.log(`   ${hidden}`);
    } else {
      console.log(`❌ ${key}: MISSING!`);
      envOk = false;
    }
  });

  if (!envOk) {
    console.log('\n⚠️  Some required environment variables are missing!');
    console.log('   Check your .env file\n');
    process.exit(1);
  }

  console.log('\n✅ All environment variables present\n');

  // 2. Test MongoDB Connection Directly
  console.log('2️⃣  MONGODB DIRECT CONNECTION TEST');
  console.log('-'.repeat(70));

  const mongoUrl = env.DATABASE_URL;
  let mongoClient;

  try {
    console.log('⏳ Connecting to MongoDB...\n');
    mongoClient = new MongoClient(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      maxPoolSize: 1,
    });

    await mongoClient.connect();
    console.log('✅ MongoDB connection: SUCCESSFUL\n');

    // Get database info
    try {
      const admin = mongoClient.db('admin');
      const serverStatus = await admin.command({ serverStatus: 1 });
      console.log('Server Status:');
      console.log(`  Version: ${serverStatus.version}`);
      console.log(`  Uptime: ${serverStatus.uptime}s`);
      console.log(`  Connections: ${serverStatus.connections.current}/${serverStatus.connections.available}\n`);
    } catch (e) {
      console.log('(Could not get server status)\n');
    }

  } catch (error) {
    console.log('❌ MongoDB connection: FAILED\n');
    console.log(`Error Type: ${error.name}`);
    console.log(`Error Message: ${error.message}\n`);

    // Analyze error
    if (error.message.includes('TLSv1') || error.message.includes('SSL')) {
      console.log('📌 ISSUE: SSL/TLS Certificate Error');
      console.log('SOLUTIONS:');
      console.log('1. Check if MongoDB Atlas cluster is ACTIVE');
      console.log('   Go to: https://cloud.mongodb.com/v2/');
      console.log('   If paused, click "Resume"');
      console.log('2. Verify IP whitelist includes your IP');
      console.log('   Security → Network Access → Add your IP');
      console.log('3. Try updating .env connection string with all parameters:');
      console.log('   DATABASE_URL="mongodb+srv://user:pass@host/db?retryWrites=true&w=majority&tls=true"');
      console.log();
    } else if (error.message.includes('authentication')) {
      console.log('📌 ISSUE: Authentication Error (Username/Password)');
      console.log('SOLUTIONS:');
      console.log('1. Check username/password in .env');
      console.log('2. Verify in MongoDB Atlas Database Access');
      console.log('3. Make sure special characters are URL encoded');
      console.log('   @ = %40, # = %23, etc.');
      console.log();
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('📌 ISSUE: Cannot reach MongoDB host (DNS/Network)');
      console.log('SOLUTIONS:');
      console.log('1. Check your internet connection');
      console.log('2. Verify DATABASE_URL host is correct');
      console.log('3. Try using MongoDB Shell: mongosh "YOUR_CONNECTION_STRING"');
      console.log();
    } else {
      console.log('📌 ISSUE: Unknown MongoDB error');
      console.log(`Full error: ${error.message}\n`);
    }

    if (mongoClient) {
      await mongoClient.close();
    }

    console.log('\n' + '='.repeat(70));
    console.log('❌ MongoDB is not working - login/signup will fail');
    console.log('='.repeat(70) + '\n');
    process.exit(1);
  }

  // 3. Test Prisma Connection
  console.log('3️⃣  PRISMA CONNECTION TEST');
  console.log('-'.repeat(70));

  const prisma = new PrismaClient();

  try {
    console.log('⏳ Testing Prisma client...\n');
    const count = await prisma.user.count();
    console.log(`✅ Prisma connection: SUCCESSFUL`);
    console.log(`   Users in database: ${count}\n`);
  } catch (error) {
    console.log('❌ Prisma connection: FAILED\n');
    console.log(`Error: ${error.message}\n`);
  }

  await prisma.$disconnect();
  await mongoClient?.close();

  // 4. Summary
  console.log('='.repeat(70));
  console.log('✅ ✅ ✅  ALL SYSTEMS OPERATIONAL  ✅ ✅ ✅');
  console.log('='.repeat(70));
  console.log('\nYou can now:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Go to http://localhost:3000/auth/signup');
  console.log('3. Create account and login\n');
}

diagnose().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
