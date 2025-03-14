'use client';

import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push('/domains');
    }
  }, [user, router]);

  
  return !user ? (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          域名标注系统
        </h1>
        <LoginForm />
      </div>
    </main>
  ) : null;
}
