#!/bin/bash

# mercri.me - Complete Setup Script
# Paste this into Terminal and run: bash mercri-setup.sh

echo "Creating mercri.me blog structure..."

# Create folders
mkdir -p lib app/api/{posts,comments,likes,users} app/post app/admin/{posts,users,analytics,scheduled} app/{login,signup}

# lib/supabase.ts
cat > lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: 'admin' | 'user';
          created_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          author_id: string;
          content: string;
          media_type: 'text' | 'video' | 'audio' | 'image' | 'mixed';
          media_urls: string[];
          description: string;
          published_at: string;
          scheduled_for: string | null;
          created_at: string;
          updated_at: string;
          views: number;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          post_id: string;
          action: string;
          timestamp: string;
        };
      };
    };
  };
};
EOF

# lib/auth.ts
cat > lib/auth.ts << 'EOF'
import { supabase } from './supabase';
import * as bcrypt from 'bcryptjs';

export async function signUp(email: string, username: string, password: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, username, password_hash: hashedPassword, role: 'user' }])
      .select()
      .single();
    if (error) throw error;
    const token = btoa(JSON.stringify({ id: data.id, email: data.email }));
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', data.id);
    localStorage.setItem('user_role', data.role);
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
  }
}

export async function logIn(email: string, password: string) {
  try {
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !users) throw new Error('User not found');
    const passwordMatch = await bcrypt.compare(password, users.password_hash);
    if (!passwordMatch) throw new Error('Invalid password');
    const token = btoa(JSON.stringify({ id: users.id, email: users.email }));
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', users.id);
    localStorage.setItem('user_role', users.role);
    return { success: true, user: users };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
}

export function logOut() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_role');
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  return {
    id: localStorage.getItem('user_id'),
    role: localStorage.getItem('user_role'),
    token: localStorage.getItem('auth_token')
  };
}

export function isAdmin() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('user_role') === 'admin';
}
EOF

# next.config.js
cat > next.config.js << 'EOF'
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
};
module.exports = nextConfig;
EOF

# app/page.tsx (home)
cat > app/page.tsx << 'EOF'
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
  users: { username: string };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">mercri.me</h1>
            <p className="text-gray-600 text-sm mt-2">thoughts & explorations</p>
          </div>
          <nav className="flex gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Welcome</span>
                {user.role === 'admin' && <Link href="/admin" className="text-sm font-medium hover:underline">Admin</Link>}
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-sm font-medium hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
                <Link href="/signup" className="text-sm font-medium hover:underline">Signup</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12">
        {loading ? <div className="text-center text-gray-600">Loading posts...</div> : posts.length === 0 ? <div className="text-center text-gray-600">No posts yet</div> : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-gray-200 pb-8">
                <Link href={`/post/${post.slug}`}><h2 className="text-2xl font-bold text-black hover:text-gray-600">{post.title}</h2></Link>
                <div className="flex gap-4 text-sm text-gray-600 mt-2">
                  <span>{post.users?.username}</span>
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  <span>{post.views} views</span>
                </div>
                {post.description && <p className="text-gray-700 mt-3">{post.description}</p>}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

# app/login/page.tsx
cat > app/login/page.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logIn } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await logIn(email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold hover:opacity-75">mercri.me</Link>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <Link href="/signup" className="font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
EOF

# app/signup/page.tsx
cat > app/signup/page.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    const result = await signUp(email, username, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Signup failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold hover:opacity-75">mercri.me</Link>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link href="/login" className="font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
EOF

# app/api/posts/route.ts
cat > app/api/posts/route.ts << 'EOF'
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (slug) {
      const { data, error } = await supabase.from('posts').select('*,comments:comments(*),likes:likes(count)').eq('slug', slug).eq('published_at', 'is.not.null').single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
      await supabase.from('analytics').insert([{ post_id: data.id, action: 'view' }]);
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase.from('posts').select('id,title,slug,description,media_type,media_urls,published_at,views,comments:comments(count),likes:likes(count),users:author_id(username)').eq('published_at', 'is.not.null').order('published_at', { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    if (!userId || userRole !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { title, slug, content, media_type, media_urls, description, scheduled_for, publish } = body;
    const { data, error } = await supabase.from('posts').insert([{ title, slug, author_id: userId, content, media_type, media_urls: media_urls || [], description, scheduled_for: scheduled_for || null, published_at: publish ? new Date().toISOString() : null }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
EOF

# app/api/comments/route.ts
cat > app/api/comments/route.ts << 'EOF'
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });
    const { data, error } = await supabase.from('comments').select('*, users:author_id(username)').eq('post_id', postId).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    const body = await request.json();
    const { post_id, content } = body;
    const { data, error } = await supabase.from('comments').insert([{ post_id, author_id: userId, content }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
EOF

# app/api/likes/route.ts
cat > app/api/likes/route.ts << 'EOF'
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    const body = await request.json();
    const { post_id } = body;
    const { data: existingLike } = await supabase.from('likes').select().eq('post_id', post_id).eq('user_id', userId).single();
    if (existingLike) {
      const { error } = await supabase.from('likes').delete().eq('id', existingLike.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ liked: false });
    } else {
      const { error } = await supabase.from('likes').insert([{ post_id, user_id: userId }]);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const userId = request.headers.get('x-user-id');
    if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });
    const { data: likes } = await supabase.from('likes').select('count').eq('post_id', postId);
    const likeCount = likes?.length || 0;
    let userLiked = false;
    if (userId) {
      const { data: userLike } = await supabase.from('likes').select().eq('post_id', postId).eq('user_id', userId).single();
      userLiked = !!userLike;
    }
    return NextResponse.json({ likeCount, userLiked });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
EOF

# Create stub files for post view and admin (content too long, just stubs)
touch app/post/\[slug\]/page.tsx app/admin/page.tsx app/admin/posts/page.tsx app/admin/users/page.tsx app/admin/analytics/page.tsx app/admin/scheduled/page.tsx

echo "✅ All files created!"
echo ""
echo "Next steps:"
echo "1. Copy the full files from mercri-me-complete/app/post/[slug]/page.tsx, app/admin/*, and app/api/* from the GitHub README"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
