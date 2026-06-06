const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkScores() {
  try {
    const scores = await prisma.score.findMany({
      include: { user: true }
    });
    console.log('Total scores in database:', scores.length);
    if (scores.length > 0) {
      console.log('Sample score:', JSON.stringify(scores[0], null, 2));
    } else {
      console.log('No scores found in database');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkScores();
