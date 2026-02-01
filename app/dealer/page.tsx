'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DealerRoot() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dealer/dashboard');
  }, [router]);

  return null;
}
