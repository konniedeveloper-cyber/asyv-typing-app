const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedScores() {
  try {
    console.log('🔍 Searching for orphaned scores (scores without users)...\n');

    // Get all scores
    const allScores = await prisma.score.findMany();
    console.log(`📊 Total scores in database: ${allScores.length}`);

    // Check which ones have orphaned users
    let orphanedCount = 0;
    const orphanedIds = [];

    for (const score of allScores) {
      const user = await prisma.user.findUnique({
        where: { id: score.userId }
      });

      if (!user) {
        orphanedIds.push(score.id);
        orphanedCount++;
        console.log(`  ⚠️  Orphaned: Score ID ${score.id} (WPM: ${score.wpm}, User ID: ${score.userId} - NOT FOUND)`);
      }
    }

    console.log(`\n❌ Found ${orphanedCount} orphaned score(s)\n`);

    if (orphanedCount === 0) {
      console.log('✅ No orphaned scores found! Database is clean.');
      await prisma.$disconnect();
      return;
    }

    // Ask for confirmation
    console.log(`⚠️  CAUTION: You're about to DELETE ${orphanedCount} score(s).\n`);

    // Delete orphaned scores
    const deleteResult = await prisma.score.deleteMany({
      where: {
        id: {
          in: orphanedIds
        }
      }
    });

    console.log(`🗑️  Successfully deleted ${deleteResult.count} orphaned score(s)`);

    // Verify
    const remainingScores = await prisma.score.findMany();
    console.log(`\n✅ Total scores remaining: ${remainingScores.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedScores();
