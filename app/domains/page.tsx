import { getDomainsWithRatings } from '@/lib/db';
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

  const domains = await getDomainsWithRatings.all(user.id, user.subject_code);
  const domainsWithRatings = domains.map((domain: any) => ({
    domain: domain.domain,
    subject_code: domain.subject_code,
    url: domain.url,
    rating: domain.relevance ? {
      relevance: domain.relevance,
      popularity: domain.popularity,
      professionalism: domain.professionalism
    } : undefined
  }));

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{user.subject_code}</h1>
      <DomainList initialDomains={domainsWithRatings} />
    </main>
  );
} 