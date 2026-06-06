const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateLeaderboard() {
  try {
    console.log('🔍 Fetching all users from database...');
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found ${users.length} user(s): ${users.map(u => u.username).join(', ')}`);

    // Sample scores to add for each user
    const scoreTemplates = [
      { wpm: 65, accuracy: 92, rawWpm: 67 },
      { wpm: 72, accuracy: 95, rawWpm: 74 },
      { wpm: 78, accuracy: 88, rawWpm: 81 },
      { wpm: 85, accuracy: 93, rawWpm: 87 },
    ];

    let totalScoresCreated = 0;

    for (const user of users) {
      console.log(`\n📝 Adding scores for: ${user.username} (${user.email})`);

      for (const scoreData of scoreTemplates) {
        const score = await prisma.score.create({
          data: {
            wpm: scoreData.wpm,
            accuracy: scoreData.accuracy,
            rawWpm: scoreData.rawWpm,
            userId: user.id,
          },
        });
        console.log(`  ✓ Score added: ${score.wpm} WPM, ${score.accuracy}% accuracy`);
        totalScoresCreated++;
      }
    }

    console.log(`\n✅ Successfully created ${totalScoresCreated} scores for your users!`);
    console.log('🚀 Leaderboard is now populated.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateLeaderboard();
