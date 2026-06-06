import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function debugCredentials() {
  console.log('\n🔍 === CREDENTIALS DEBUGGING ===\n');

  // Test 1: Check if any users exist with password hashes
  console.log('📋 Test 1: Users with passwords in database');
  try {
    const users = await prisma.user.findMany({
      where: {
        password: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
      }
    });

    if (users.length === 0) {
      console.log('⚠️  No users found with passwords! Users may have only OAuth accounts.');
    } else {
      console.log(`✅ Found ${users.length} user(s) with passwords:`);
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.username}) [Role: ${user.role}]`);
        console.log(`    Hash: ${user.password.substring(0, 20)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }

  // Test 2: Test bcrypt hash/compare
  console.log('\n📋 Test 2: Testing bcrypt hash and compare');
  try {
    const testPassword = 'TestPassword123!';
    console.log(`Testing password: "${testPassword}"`);
    
    const hash = await bcrypt.hash(testPassword, 10);
    console.log(`✅ Generated hash: ${hash.substring(0, 20)}...`);
    
    const isValid = await bcrypt.compare(testPassword, hash);
    console.log(`✅ Correct password validation: ${isValid}`);
    
    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    console.log(`✅ Wrong password validation: ${isInvalid}`);
  } catch (error) {
    console.error('❌ Bcrypt error:', error.message);
  }

  // Test 3: Check the actual password hashes in DB
  console.log('\n📋 Test 3: Testing actual database user authentication');
  try {
    const user = await prisma.user.findFirst({
      where: {
        password: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });

    if (!user) {
      console.log('⚠️  No users with passwords found');
    } else {
      console.log(`ℹ️  Testing with user: ${user.email}`);
      
      // Try a few common test passwords
      const testPasswords = ['password', 'Password123', 'test123', 'admin'];
      
      for (const pwd of testPasswords) {
        try {
          const match = await bcrypt.compare(pwd, user.password);
          if (match) {
            console.log(`✅ MATCH FOUND: Password "${pwd}" matches ${user.email}`);
          }
        } catch (e) {
          // Ignore
        }
      }
      console.log('ℹ️  If no matches found above, the stored password hash is not for any common test password');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Check OAuth users (no passwords)
  console.log('\n📋 Test 4: Users with OAuth only (no passwords)');
  try {
    const oauthOnlyUsers = await prisma.user.findMany({
      where: {
        password: null
      },
      select: {
        email: true,
        username: true,
        role: true,
      },
      take: 5
    });

    if (oauthOnlyUsers.length === 0) {
      console.log('✅ No OAuth-only users found');
    } else {
      console.log(`⚠️  Found ${oauthOnlyUsers.length} OAuth-only users (cannot login with credentials):`);
      oauthOnlyUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.username})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 5: Create a test user if needed
  console.log('\n📋 Test 5: Creating test user (testuser@example.com / TestPass123!)');
  try {
    const testPassword = 'TestPass123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'testuser@example.com' }
    });

    if (existingUser) {
      console.log('ℹ️  Test user already exists');
      // Try to login with known password
      const match = await bcrypt.compare(testPassword, existingUser.password || '');
      if (match) {
        console.log('✅ Test user password is: TestPass123!');
      } else {
        console.log('⚠️  Test user exists but password is not TestPass123!');
      }
    } else {
      const newUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          username: 'testuser',
          password: hashedPassword,
          gender: 'male',
          classId: 'EY jupiter',
          role: 'student'
        }
      });
      console.log('✅ Created test user:');
      console.log(`  Email: testuser@example.com`);
      console.log(`  Password: TestPass123!`);
      console.log(`  Username: testuser`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✨ Debugging complete!\n');
  process.exit(0);
}

debugCredentials().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
