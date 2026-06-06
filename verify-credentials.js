#!/usr/bin/env node

/**
 * Direct Database & Bcrypt Verification
 * Tests if user exists and if password matches in database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyCredentials() {
  console.log('\n🔍 Credential Verification Tool\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  };

  try {
    const email = await question('Enter email to verify: ');
    const password = await question('Enter password to test: ');

    console.log('\n📊 Checking database...\n');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database with email:', email);
      console.log('\n💡 Have you signed up with this email?');
      console.log('   Go to http://localhost:3000/auth/signup to create account\n');
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log('✅ User found in database');
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   User ID:', user.id);
    console.log('   Created:', user.createdAt);
    console.log('');

    // Check password hash
    if (!user.password) {
      console.log('❌ User has NO password hash in database!');
      console.log('   This user was created with OAuth (Google/GitHub) only\n');
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log('✅ User has password hash');
    console.log('   Hash length:', user.password.length);
    console.log('   Hash starts with:', user.password.substring(0, 15) + '...');
    console.log('');

    // Test bcrypt comparison
    console.log('🧪 Testing bcrypt password comparison...\n');
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log('✅ ✅ ✅ PASSWORD MATCHES! ✅ ✅ ✅');
      console.log('\n   The password is correct in the database.');
      console.log('   If login still fails, the issue is elsewhere.\n');
    } else {
      console.log('❌ ❌ ❌ PASSWORD DOES NOT MATCH ❌ ❌ ❌');
      console.log('\n   The provided password does not match the stored hash.');
      console.log('   Suggestions:');
      console.log('   1. Check for typos in your password');
      console.log('   2. Ensure CAPS LOCK is not on');
      console.log('   3. Reset password if you forgot');
      console.log('   4. Delete account and sign up again\n');
    }

    // Try to hash the provided password for comparison
    console.log('🔐 Password Analysis:\n');
    console.log('   Provided password length:', password.length);
    console.log('   Provided password:', password);
    
    // Try re-hashing to see if it matches
    const rehash = await bcrypt.hash(password, 10);
    console.log('   New hash would be:', rehash.substring(0, 30) + '...');
    console.log('   Current hash is:', user.password.substring(0, 30) + '...');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('2. Check DATABASE_URL in .env');
    console.error('3. Ensure Prisma migrations are up to date: npx prisma migrate dev');
  } finally {
    rl.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

verifyCredentials();
