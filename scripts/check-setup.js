#!/usr/bin/env node

/**
 * Setup and test script for the Typing Auth application
 * This script checks if everything is configured correctly
 */

import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

async function checkSetup() {
  console.log('🔍 Checking Typing Auth Setup...\n');

  let errors = [];
  let warnings = [];

  // Check .env file
  console.log('1️⃣  Checking .env configuration...');
  const envPath = path.resolve('.env');
  const envLocalPath = path.resolve('.env.local');

  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
    errors.push('Missing .env or .env.local file');
  } else {
    console.log('   ✅ Environment file found');
  }

  // Check database connection
  console.log('\n2️⃣  Testing database connection...');
  try {
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`   ✅ Connected to database (${userCount} users)`);
  } catch (error) {
    errors.push(`Database connection failed: ${error.message}`);
  }

  // Check if tables exist
  console.log('\n3️⃣  Checking database schema...');
  try {
    const classCount = await prisma.class.count();
    console.log('   ✅ User and Class tables exist');
  } catch (error) {
    warnings.push('Class table might not be ready yet');
  }

  // Check key files
  console.log('\n4️⃣  Checking required files...');
  const requiredFiles = [
    'lib/auth.js',
    'app/auth/login/LoginContent.jsx',
    'app/auth/signup/page.js',
    'app/teacher-dashboard/page.js',
    'app/api/auth/signup/route.js',
    'app/api/teacher/class/[classId]/route.js',
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(path.resolve(file))) {
      console.log(`   ✅ ${file}`);
    } else {
      errors.push(`Missing file: ${file}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (errors.length === 0) {
    console.log('✅ Setup looks good!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Go to http://localhost:3000/auth/signup');
    console.log('   3. Create a student account');
    console.log('   4. To make user an admin, run:');
    console.log('      node scripts/grant-admin-access.js <email>\n');
  } else {
    console.log('❌ Setup issues found:\n');
    errors.forEach((err) => console.log(`   - ${err}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach((warn) => console.log(`   - ${warn}`));
  }

  await prisma.$disconnect();
  process.exit(errors.length > 0 ? 1 : 0);
}

checkSetup();
