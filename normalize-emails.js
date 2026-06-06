#!/usr/bin/env node

/**
 * Fix email case sensitivity in database
 * Normalizes all user emails to lowercase
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function normalizeEmails() {
  try {
    console.log('\n🔧 Normalizing User Emails\n');

    // Get all users
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log('✅ No users in database - nothing to normalize\n');
      await prisma.$disconnect();
      return;
    }

    console.log(`Found ${users.length} user(s)\n`);

    let updated = 0;

    for (const user of users) {
      const emailLower = user.email?.toLowerCase();
      
      if (user.email !== emailLower) {
        console.log(`Updating: "${user.email}" → "${emailLower}"`);
        
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { email: emailLower },
          });
          updated++;
        } catch (error) {
          console.error(`   ❌ Failed to update: ${error.message}`);
        }
      }
    }

    if (updated === 0) {
      console.log('✅ All emails are already normalized\n');
    } else {
      console.log(`\n✅ Updated ${updated} email(s) to lowercase\n`);
    }

    console.log('Normalized users:');
    const updatedUsers = await prisma.user.findMany();
    updatedUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.username})`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

normalizeEmails();
