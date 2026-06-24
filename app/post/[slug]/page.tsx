'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Demo {
  name: string;
  url: string;
  date: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_art_url?: string;
  spotify_url?: string;
  apple_music_url?: string;
  credits?: string;
  process_description?: string;
  demos?: Demo[];
  views: number;
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [demosOpen, setDemosOpen] = useState(false);

  useEffect(() => {
    fetch('/api/posts/' + params.slug)
      .then(r => r.json())
      .then(data => setPost(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!post || !post.title) return <p className="p-8">Post not found</p>;

  const demos = post.demos || [];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 block">Back</Link>
          <h1 className="text-5xl font-light mb-2">{post.title}</h1>
          <p className="text-gray-600">{post.description}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {post.cover_art_url && (
          <img src={post.cover_art_url} alt={post.title} className="w-full h-auto mb-6 rounded" />
        )}

        {post.spotify_url && (
          <iframe
            src={'https://open.spotify.com/embed/track/' + post.spotify_url.split('/').pop() + '?utm_source=generator'}
            width="100%"
            height="152"
            className="mb-4"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}

        {post.apple_music_url && (
          <div className="bg-gray-50 p-4 rounded mb-12">
            <p className="text-sm text-gray-600 mb-2">Listen on Apple Music:</p>
            <a href={post.apple_music_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              Open in Apple Music
            </a>
          </div>
        )}

        {post.credits && (
          <div className="mb-12 pb-12 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Credits</h2>
            <p className="text-gray-700 whitespace-pre-line">{post.credits}</p>
          </div>
        )}

        {post.process_description && (
          <div className="mb-12 pb-12 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Making This Song</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.process_description}</p>
          </div>
        )}

        {demos.length > 0 && (
          <div className="mb-12">
            <button onClick={() => setDemosOpen(!demosOpen)} className="flex items-center gap-2 text-lg font-semibold hover:text-blue-600 transition">
              <span>{demosOpen ? 'v' : '>'}</span>
              Earlier Demos ({demos.length})
            </button>

            {demosOpen && (
              <div className="mt-6 space-y-4">
                {demos.map((demo, idx) => (
                  <a key={idx} href={demo.url} target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded hover:border-blue-600 hover:bg-blue-50 transition">
                    <p className="font-medium text-gray-900">{demo.name}</p>
                    <p className="text-sm text-gray-600">{demo.date}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-gray-600 text-sm mt-8">
          {post.views} {post.views === 1 ? 'view' : 'views'}
        </p>
      </main>
    </div>
  );
}
