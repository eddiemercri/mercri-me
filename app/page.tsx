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
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const token = btoa(JSON.stringify({ id: data.user.id, email: data.user.email }));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_role', data.user.role || 'admin');
        window.location.reload();
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Login error');
    }
    setAuthLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const token = btoa(JSON.stringify({ id: data.user.id, email: data.user.email }));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_role', 'admin');
        window.location.reload();
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      alert('Signup error');
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl font-bold text-black">mercri.me</h1>
          <p className="text-gray-600 text-sm mt-3">thoughts & explorations</p>
          <nav className="flex gap-6 justify-center mt-6">
            {user?.id ? (
              <>
                <Link href="/admin" className="text-sm hover:underline">Admin</Link>
                <button onClick={handleLogout} className="text-sm hover:underline">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="text-sm hover:underline">Login</button>
                <button onClick={() => setShowSignup(true)} className="text-sm hover:underline">Signup</button>
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
                <Link href={'/post/' + post.slug}>
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

      {(showLogin || showSignup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowLogin(false); setShowSignup(false); }}>
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{showLogin ? 'Login' : 'Signup'}</h2>
            <form onSubmit={showLogin ? handleLogin : handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
              >
                {authLoading ? 'Loading...' : (showLogin ? 'Login' : 'Signup')}
              </button>
              <button
                type="button"
                onClick={() => { setShowLogin(false); setShowSignup(false); }}
                className="w-full text-gray-600 hover:text-black"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
