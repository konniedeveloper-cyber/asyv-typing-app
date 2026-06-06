#!/usr/bin/env node

/**
 * List all users in the database
 * Helpful for debugging and verifying account creation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('\n📋 All Users in Database\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        gender: true,
        hasPassword: {
          select: {
            password: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Since select doesn't work with computed fields, we need to check differently
    const usersWithPassword = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (usersWithPassword.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 Steps to create a user:');
      console.log('1. Go to http://localhost:3000/auth/signup');
      console.log('2. Fill in the form');
      console.log('3. Click "Sign Up"');
      console.log('4. Run this script again to see the user\n');
    } else {
      console.log(`Found ${usersWithPassword.length} user(s):\n`);
      
      usersWithPassword.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   - Username: ${user.username || 'N/A'}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Gender: ${user.gender || 'N/A'}`);
        console.log(`   - Has Password: ${user.password ? '✅ Yes' : '❌ No (OAuth only)'}`);
        console.log(`   - Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('');
      });

      console.log('💡 To verify a specific user\'s password:');
      console.log('   node verify-credentials.js');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('2. Check DATABASE_URL in .env');
    console.error('3. Run: npx prisma migrate deploy');
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
