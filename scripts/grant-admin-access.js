#!/usr/bin/env node

/**
 * Script to grant admin/teacher access to a user
 * Usage: node scripts/grant-admin-access.js <email> [role]
 * Example: node scripts/grant-admin-access.js user@example.com admin
 *          node scripts/grant-admin-access.js user@example.com teacher
 */

import prisma from '../lib/prisma.js';

async function grantAdminAccess() {
  const email = process.argv[2];
  const role = process.argv[3] || 'teacher';

  if (!email) {
    console.error('❌ Please provide an email address');
    console.error('Usage: node scripts/grant-admin-access.js <email> [role]');
    console.error('Roles: student, teacher, admin');
    process.exit(1);
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.error('Valid roles: student, teacher, admin');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username || user.email}`);
    console.log(`📝 Current role: ${user.role}`);

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: role },
    });

    console.log(`✅ Role updated to: ${updatedUser.role}`);
    if (role === 'teacher') {
      console.log(`🎉 User can now access /teacher-dashboard`);
    } else if (role === 'admin') {
      console.log(`🎉 User can now access /admin-dashboard`);
    } else {
      console.log(`🎉 User role changed to student`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

grantAdminAccess();
