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
    <div className="min-h-screen bg-white font-light">
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl font-light text-black">mercri.me</h1>
          <p className="text-gray-600 text-sm mt-3 font-light">thoughts & explorations</p>
          <nav className="flex gap-6 justify-center mt-6">
            {user?.id ? (
              <>
                <span className="text-sm text-gray-600 font-light">Welcome</span>
                {user.role === 'admin' && <Link href="/admin" className="text-sm font-light hover:underline">Admin</Link>}
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-sm font-light hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-light hover:underline">Login</Link>
                <Link href="/signup" className="text-sm font-light hover:underline">Signup</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-gray-600 font-light">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-600 font-light">No posts yet. Create one in the admin panel!</div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.id} className="text-center border-b border-gray-200 pb-12">
                <Link href={`/post/${post.slug}`}>
                  <h2 className="text-3xl font-light text-black hover:text-gray-600">{post.title}</h2>
                </Link>
                <div className="flex gap-4 text-sm text-gray-600 mt-3 justify-center font-light">
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  <span>{post.views} views</span>
                </div>
                {post.description && <p className="text-gray-700 mt-4 font-light">{post.description}</p>}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
