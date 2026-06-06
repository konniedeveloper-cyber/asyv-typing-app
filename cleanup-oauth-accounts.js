#!/usr/bin/env node

/**
 * Clean up orphaned OAuth accounts
 * Run: node cleanup-oauth-accounts.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedAccounts() {
  try {
    console.log('🧹 Starting cleanup of orphaned OAuth accounts...\n');

    // Get all accounts
    const allAccounts = await prisma.account.findMany();
    console.log(`📊 Total accounts in database: ${allAccounts.length}`);

    // Find orphaned accounts (accounts without valid user)
    let orphanedCount = 0;
    const orphanedAccountIds = [];

    for (const account of allAccounts) {
      const user = await prisma.user.findUnique({
        where: { id: account.userId },
      });

      if (!user) {
        orphanedCount++;
        orphanedAccountIds.push(account.id);
        console.log(`  ❌ Orphaned: ${account.provider} (${account.providerAccountId})`);
      }
    }

    console.log(`\n🔗 Found ${orphanedCount} orphaned account(s)\n`);

    if (orphanedCount > 0) {
      // Delete orphaned accounts
      const deleteResult = await prisma.account.deleteMany({
        where: {
          id: { in: orphanedAccountIds },
        },
      });

      console.log(`✅ Deleted ${deleteResult.count} orphaned account(s)\n`);
    }

    // Get final account count
    const finalAccounts = await prisma.account.findMany();
    console.log(`📊 Final account count: ${finalAccounts.length}`);
    console.log('✨ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedAccounts();
