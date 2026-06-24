'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ScheduledPost {
  id: string;
  title: string;
  published_at: string;
}

export default function Scheduled() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scheduled')
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold">Scheduled Posts</h1>
          <p className="text-gray-600 mt-2">Posts queued for future publishing</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600">No scheduled posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Publishing: {new Date(post.published_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link href="/admin" className="text-blue-600 hover:underline mt-8 block">
          ← Back to Admin
        </Link>
      </main>
    </div>
  );
}
