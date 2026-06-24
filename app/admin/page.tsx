'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  published_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/');
      return;
    }
    
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (!isAdmin()) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your blog posts</p>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/admin/posts">
          <button className="mb-8 px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800">
            + Create New Post
          </button>
        </Link>

        <div>
          <h2 className="text-2xl font-bold mb-6">Your Posts</h2>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-gray-600">No posts yet. Create your first one!</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded p-4">
                  <h3 className="font-bold text-lg">{post.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                  <div className="flex gap-4 mt-4">
                    <Link href={`/post/${post.slug}`}>
                      <button className="text-sm text-blue-600 hover:underline">View</button>
                    </Link>
                    <Link href={`/admin/posts?id=${post.id}`}>
                      <button className="text-sm text-blue-600 hover:underline">Edit</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
