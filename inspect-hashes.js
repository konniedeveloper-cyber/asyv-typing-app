#!/usr/bin/env node

/**
 * Inspect Password Hashes
 * Shows if passwords in database are valid bcrypt hashes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isBcryptHash(str) {
  // Bcrypt hashes always start with $2a$, $2b$, $2x$, or $2y$ and are 60 characters
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str);
}

async function inspectHashes() {
  try {
    console.log('\n📊 Password Hash Inspector\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ No users in database\n');
      await prisma.$disconnect();
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);

    let validCount = 0;
    let missingCount = 0;
    let invalidCount = 0;

    users.forEach((user) => {
      console.log(`User: ${user.email}`);
      console.log(`  Username: ${user.username}`);

      if (!user.password) {
        console.log(`  Password: ❌ MISSING (OAuth only)\n`);
        missingCount++;
        return;
      }

      const isValid = isBcryptHash(user.password);
      const length = user.password.length;
      const start = user.password.substring(0, 20);

      console.log(`  Password Hash:`);
      console.log(`    Length: ${length} (expected: 60)`);
      console.log(`    Starts with: ${start}...`);
      console.log(`    Is Valid Bcrypt: ${isValid ? '✅ YES' : '❌ NO'}\n`);

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    });

    console.log('Summary:');
    console.log(`  ✅ Valid bcrypt hashes: ${validCount}`);
    console.log(`  ❌ Invalid hashes: ${invalidCount}`);
    console.log(`  ⚠️  Missing passwords: ${missingCount}\n`);

    if (validCount === users.length) {
      console.log('✅ All passwords are valid bcrypt hashes!\n');
    } else if (invalidCount > 0) {
      console.log('❌ Some passwords are NOT valid bcrypt hashes!');
      console.log('This could cause login failures.\n');
      console.log('Solution: Delete and recreate those accounts\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

inspectHashes();
