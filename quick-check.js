const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndPopulate() {
  try {
    console.log('Checking database...');
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users:`);
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.username} (${u.email}) - ID: ${u.id}`);
    });

    // Get all scores
    const scores = await prisma.score.findMany();
    console.log(`\n✅ Found ${scores.length} scores`);
    if (scores.length > 0) {
      console.log('Sample scores:');
      scores.slice(0, 3).forEach(s => {
        console.log(`  - WPM: ${s.wpm}, Accuracy: ${s.accuracy}%, User ID: ${s.userId}`);
      });
    }

    // If no scores but users exist, populate
    if (scores.length === 0 && users.length > 0) {
      console.log('\n⚠️  No scores found. Populating...');
      
      let created = 0;
      for (const user of users) {
        await prisma.score.create({
          data: { wpm: 75, accuracy: 92, rawWpm: 77, userId: user.id }
        });
        await prisma.score.create({
          data: { wpm: 68, accuracy: 89, rawWpm: 70, userId: user.id }
        });
        await prisma.score.create({
          data: { wpm: 82, accuracy: 95, rawWpm: 85, userId: user.id }
        });
        created += 3;
      }
      console.log(`✅ Created ${created} scores`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('Done');
  }
}

checkAndPopulate();
