'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  media_type: string;
  published_at: string;
  views: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl font-bold text-black">mercri.me</h1>
          <p className="text-gray-600 text-sm mt-3">thoughts & explorations</p>
          <nav className="flex gap-6 justify-center mt-6">
            {user?.id ? (
              <>
                <Link href="/admin" className="text-sm hover:underline">
                  Admin
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.reload();
                  }}
                  className="text-sm hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="?login=true" className="text-sm hover:underline">
                  Login
                </Link>
                <Link href="?signup=true" className="text-sm hover:underline">
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <article key={post.id} className="pb-8 border-b border-gray-200 last:border-0">
                <Link href={`/post/${post.slug}`}>
                  <h2 className="text-2xl font-semibold hover:text-blue-600 transition cursor-pointer">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mt-2">{post.description}</p>
                <div className="flex gap-4 text-sm text-gray-500 mt-4">
                  <span>{post.media_type}</span>
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  <span>{post.views} views</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
