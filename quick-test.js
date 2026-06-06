const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Users in DB:', userCount);
    
    const scoreCount = await prisma.score.count();
    console.log('✅ Scores in DB:', scoreCount);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({ select: { id: true, username: true } });
      console.log('Users:', users);
      
      if (scoreCount === 0) {
        console.log('\nCreating test scores...');
        for (const user of users) {
          await prisma.score.create({
            data: {
              wpm: 75,
              accuracy: 90,
              rawWpm: 78,
              userId: user.id,
            }
          });
          console.log(`✅ Added score for ${user.username}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
