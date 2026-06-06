const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const totalUsers = await prisma.user.count();
    const totalScores = await prisma.score.count();
    const maleUsers = await prisma.user.count({ where: { gender: 'male' } });
    const femaleUsers = await prisma.user.count({ where: { gender: 'female' } });
    
    console.log('✅ MongoDB Atlas Connected!');
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`   ♂ Male: ${maleUsers}`);
    console.log(`   ♀ Female: ${femaleUsers}`);
    console.log(`📈 Total Scores: ${totalScores}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
