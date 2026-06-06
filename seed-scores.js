const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedScores() {
  try {
    console.log('🔍 Fetching all users...');
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found ${users.length} user(s)`);

    // Sample score data - will create 3-5 scores per user with varying stats
    const scoreTemplates = [
      { wpm: 65, accuracy: 92, rawWpm: 67 },
      { wpm: 72, accuracy: 95, rawWpm: 74 },
      { wpm: 78, accuracy: 88, rawWpm: 81 },
      { wpm: 85, accuracy: 93, rawWpm: 87 },
      { wpm: 70, accuracy: 90, rawWpm: 72 },
    ];

    let totalScoresCreated = 0;

    for (const user of users) {
      console.log(`\n📝 Creating scores for user: ${user.username} (${user.email})`);

      // Create 3-5 random scores for each user
      const numScores = Math.floor(Math.random() * 3) + 3; // 3-5 scores
      const selectedScores = scoreTemplates
        .sort(() => Math.random() - 0.5)
        .slice(0, numScores);

      for (const scoreData of selectedScores) {
        const score = await prisma.score.create({
          data: {
            wpm: scoreData.wpm,
            accuracy: scoreData.accuracy,
            rawWpm: scoreData.rawWpm,
            userId: user.id,
          },
        });
        console.log(`  ✓ Created score: ${score.wpm} WPM, ${score.accuracy}% accuracy`);
        totalScoresCreated++;
      }
    }

    console.log(`\n✅ Successfully created ${totalScoresCreated} test scores!`);
    console.log('🚀 Your leaderboard should now be populated with data.');

  } catch (error) {
    console.error('❌ Error seeding scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedScores();
