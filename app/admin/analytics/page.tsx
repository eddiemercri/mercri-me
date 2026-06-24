'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Analytics {
  totalViews: number;
  totalPosts: number;
  totalComments: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    totalPosts: 0,
    totalComments: 0,
  });

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => setAnalytics(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-2">Your blog performance</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 rounded p-6">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-3xl font-bold mt-2">{analytics.totalViews}</p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-3xl font-bold mt-2">{analytics.totalPosts}</p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <p className="text-sm text-gray-600">Total Comments</p>
            <p className="text-3xl font-bold mt-2">{analytics.totalComments}</p>
          </div>
        </div>

        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Admin
        </Link>
      </main>
    </div>
  );
}
