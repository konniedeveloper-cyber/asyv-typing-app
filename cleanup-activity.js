#!/usr/bin/env node

/**
 * Manual cleanup script for activity records
 * Usage: node cleanup-activity.js [days] [dryRun]
 * 
 * Examples:
 *   node cleanup-activity.js              // Delete records older than 7 days
 *   node cleanup-activity.js 14           // Delete records older than 14 days
 *   node cleanup-activity.js 7 true       // Dry run - show what would be deleted
 */

const prisma = require('@prisma/client').PrismaClient;

async function cleanupActivity() {
  const args = process.argv.slice(2);
  const retentionDays = parseInt(args[0] || '7');
  const dryRun = args[1] === 'true';

  if (retentionDays < 1) {
    console.error('❌ Retention days must be at least 1');
    process.exit(1);
  }

  const db = new prisma();

  try {
    console.log('🧹 Starting activity record cleanup...\n');
    console.log(`📅 Retention period: ${retentionDays} days`);
    console.log(`🔍 Dry run: ${dryRun ? 'YES' : 'NO'}\n`);

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`🔎 Cutoff date: ${cutoffDate.toISOString()}`);
    console.log(`📊 Looking for records created before this date...\n`);

    // Find records to delete
    const recordsToDelete = await db.activity.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
      },
      take: 10, // Show first 10 for preview
    });

    const totalCount = await db.activity.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`📝 Sample of records to delete (showing first 10 of ${totalCount}):`);
    recordsToDelete.forEach((record, idx) => {
      console.log(
        `   ${idx + 1}. ID: ${record.id} | User: ${record.userId} | Created: ${record.createdAt.toISOString()}`
      );
    });

    console.log(`\n📊 Total records found: ${totalCount}\n`);

    if (dryRun) {
      console.log('🧪 DRY RUN MODE - No records were deleted\n');
      console.log(`ℹ️  To actually delete ${totalCount} records, run:`);
      console.log(`   node cleanup-activity.js ${retentionDays}\n`);
      process.exit(0);
    }

    if (totalCount === 0) {
      console.log('✅ No old records to delete. Database is clean!\n');
      process.exit(0);
    }

    // Confirm deletion
    console.log('⚠️  Ready to delete all old activity records.');
    console.log(
      `💾 This will permanently remove ${totalCount} records from the database.\n`
    );

    // For automated scripts, we'll just proceed
    // For interactive use, you might want to add a confirmation prompt
    const deletionConfirmed = true; // Set to false to add interactive confirmation

    if (!deletionConfirmed) {
      console.log('Deletion cancelled.\n');
      process.exit(0);
    }

    // Perform deletion
    console.log('🚀 Deleting old activity records...\n');

    const result = await db.activity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`✅ SUCCESS! Deleted ${result.count} activity records`);
    console.log(`📊 Database cleanup complete!\n`);
    console.log(`Summary:`);
    console.log(`  • Records deleted: ${result.count}`);
    console.log(`  • Retention period: ${retentionDays} days`);
    console.log(`  • Cutoff date: ${cutoffDate.toLocaleDateString()}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

cleanupActivity();
