const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    console.log('User details:', users.map(u => ({ id: u.id, username: u.username, email: u.email })));

    const scores = await prisma.score.findMany({
      include: {
        user: {
          select: {
            username: true,
            gender: true,
            image: true,
          }
        }
      }
    });
    console.log('Scores:', scores.length);
    console.log('Score details:', scores.map(s => ({ id: s.id, wpm: s.wpm, accuracy: s.accuracy, user: s.user })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
