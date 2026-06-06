const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting MongoDB seed...');

    // Create sample users
    const users = [];
    
    // Create 20 male users with scores
    for (let i = 1; i <= 20; i++) {
      const user = await prisma.user.create({
        data: {
          username: `male_user_${i}`,
          email: `male${i}@example.com`,
          password: 'hashed_password',
          gender: 'male',
          image: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNjZjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk0ke2l9PC90ZXh0Pjwvc3ZnPg==`,
        },
      });
      users.push(user);

      // Create 2-3 scores for each user
      const numScores = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < numScores; j++) {
        await prisma.score.create({
          data: {
            wpm: Math.floor(Math.random() * 40) + 60 + i * 2, // 62-100+ WPM
            accuracy: Math.floor(Math.random() * 10) + 85, // 85-95% accuracy
            rawWpm: Math.floor(Math.random() * 45) + 55 + i * 2,
            userId: user.id,
          },
        });
      }
    }

    // Create 20 female users with scores
    for (let i = 1; i <= 20; i++) {
      const user = await prisma.user.create({
        data: {
          username: `female_user_${i}`,
          email: `female${i}@example.com`,
          password: 'hashed_password',
          gender: 'female',
          image: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjMzM2NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkYke2l9PC90ZXh0Pjwvc3ZnPg==`,
        },
      });
      users.push(user);

      // Create 2-3 scores for each user
      const numScores = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < numScores; j++) {
        await prisma.score.create({
          data: {
            wpm: Math.floor(Math.random() * 40) + 55 + i * 2, // 55-95+ WPM
            accuracy: Math.floor(Math.random() * 8) + 87, // 87-95% accuracy
            rawWpm: Math.floor(Math.random() * 45) + 50 + i * 2,
            userId: user.id,
          },
        });
      }
    }

    console.log(`✅ Seeded 40 users with scores!`);

    // Verify data
    const totalUsers = await prisma.user.count();
    const totalScores = await prisma.score.count();
    const maleCount = await prisma.user.count({ where: { gender: 'male' } });
    const femaleCount = await prisma.user.count({ where: { gender: 'female' } });

    console.log(`
📊 Database Summary:
  - Total Users: ${totalUsers}
  - Male Users: ${maleCount}
  - Female Users: ${femaleCount}
  - Total Scores: ${totalScores}
    `);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
