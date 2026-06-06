#!/usr/bin/env node

/**
 * Test Bcrypt Directly
 * Verifies that bcrypt is working correctly with stored passwords
 */

const bcrypt = require('bcryptjs');

async function testBcrypt() {
  console.log('\n🧪 Bcrypt Direct Test\n');

  try {
    const testPassword = 'TestPassword123!';
    const testEmail = 'test@example.com';

    console.log('Test Configuration:');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}\n`);

    // Step 1: Hash the password
    console.log('Step 1: Hashing password with bcrypt...');
    const hash = await bcrypt.hash(testPassword, 10);
    console.log(`  ✓ Hash created: ${hash}\n`);

    // Step 2: Verify with correct password
    console.log('Step 2: Verifying with CORRECT password...');
    const match = await bcrypt.compare(testPassword, hash);
    console.log(`  ✓ Result: ${match}`);
    if (match) {
      console.log('  ✅ CORRECT - Password matches!\n');
    } else {
      console.log('  ❌ ERROR - Password should match!\n');
    }

    // Step 3: Verify with wrong password
    console.log('Step 3: Verifying with WRONG password...');
    const wrongMatch = await bcrypt.compare('WrongPassword123!', hash);
    console.log(`  ✓ Result: ${wrongMatch}`);
    if (!wrongMatch) {
      console.log('  ✅ CORRECT - Wrong password rejected!\n');
    } else {
      console.log('  ❌ ERROR - Wrong password should not match!\n');
    }

    // Step 4: Test with spaces
    console.log('Step 4: Verifying with SPACES (common mistake)...');
    const spaceMatch = await bcrypt.compare(' ' + testPassword + ' ', hash);
    console.log(`  Password with spaces: " ${testPassword} "`);
    console.log(`  Result: ${spaceMatch}`);
    if (!spaceMatch) {
      console.log('  ⚠️  Spaces make password NOT match!\n');
    }

    console.log('✅ Bcrypt is working correctly!\n');

  } catch (error) {
    console.error('❌ Bcrypt error:', error.message);
  }
}

testBcrypt();
