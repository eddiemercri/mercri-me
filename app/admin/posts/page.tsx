'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = getCurrentUser()?.id;
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState('text');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !title || !slug) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          media_type: mediaType,
          publish
        })
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Failed to create post'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/admin"><h1 className="text-3xl font-bold text-black hover:text-gray-600">← Back</h1></Link>
          <h2 className="text-2xl font-bold text-black mt-4">Create New Post</h2>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Post title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="post-slug"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Post content"
              rows={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publish"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="publish" className="text-sm font-medium">Publish immediately</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </main>
    </div>
  );
}
