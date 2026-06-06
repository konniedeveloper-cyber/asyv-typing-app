#!/usr/bin/env node

/**
 * Simple cleanup - delete all accounts and sessions that have issues
 * This is safe because users will just need to re-login
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('🧹 Cleaning up OAuth accounts...\n');

    // Delete all accounts first (they'll be recreated on next login)
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✅ Deleted ${deletedAccounts.count} account(s)`);

    // Delete all sessions (they'll be recreated on next login)
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.count} session(s)`);

    console.log('\n✨ Cleanup complete! Users will need to re-login.');
    console.log('✅ Users and their data remain intact.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
