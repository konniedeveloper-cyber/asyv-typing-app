#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('[1] Starting diagnostic test...');
console.log('[2] Creating Prisma client...');

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

console.log('[3] Prisma client created. Testing database connection...');

async function runTest() {
  try {
    console.log('[4] Fetching users from database...');
    const users = await prisma.user.findMany();
    console.log(`[5] ✅ Successfully fetched ${users.length} users`);
    
    if (users.length > 0) {
      console.log('[6] Sample users:');
      users.slice(0, 3).forEach((u, i) => {
        console.log(`     ${i + 1}. ${u.username} (${u.email}) - ID: ${u.id}`);
      });
    }
    
    console.log('[7] Attempting to disconnect Prisma...');
    await prisma.$disconnect();
    console.log('[8] ✅ Test completed successfully. Process should exit now.');
    process.exit(0);
    
  } catch (error) {
    console.error('[ERROR] ❌ Test failed:', error.message);
    console.error('[ERROR] Full error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

console.log('[9] Running async test function...');
runTest();

// Fallback timeout to force exit
setTimeout(() => {
  console.error('[TIMEOUT] Script did not exit after 10 seconds. Forcing exit...');
  process.exit(1);
}, 10000);
