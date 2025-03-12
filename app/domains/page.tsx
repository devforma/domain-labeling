import { getDomainsWithRatingsPaginated } from '@/lib/db';
import DomainList from '@/components/DomainList';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DomainsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  const user = JSON.parse(userCookie?.value || '{}');
  
  if (!user?.id) {
    redirect('/');
  }

  return (
    <main className="container mx-auto py-8 max-w-[1000px]">
      <h1 className="text-3xl font-bold mb-8">{user.subject_code}</h1>
      <DomainList initialDomains={[]} />
    </main>
  );
} 