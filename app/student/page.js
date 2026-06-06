import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentProfileContent from './StudentProfileContent';

export const metadata = {
  title: 'My Profile | TypingAuth',
  description: 'Update your profile and class selection',
};

export default async function StudentProfile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Redirect teachers and admins to their dashboards
  if (session.user.role === 'teacher') {
    redirect('/teacher-dashboard');
  } else if (session.user.role === 'admin') {
    redirect('/admin-dashboard');
  }

  return <StudentProfileContent />;
}
