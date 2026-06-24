'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

interface Demo {
  name: string;
  url: string;
  date: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const userId = getCurrentUser()?.id;
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('text');
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [credits, setCredits] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [demos, setDemos] = useState<Demo[]>([]);
  const [newDemo, setNewDemo] = useState({ name: '', url: '', date: '' });
  const [loading, setLoading] = useState(false);

  const handleAddDemo = () => {
    if (newDemo.name && newDemo.url) {
      setDemos([...demos, newDemo]);
      setNewDemo({ name: '', url: '', date: '' });
    }
  };

  const handleRemoveDemo = (idx: number) => {
    setDemos(demos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !title || !slug) {
      alert('Please fill in title and slug');
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
          media_type: mediaType,
          cover_art_url: coverArtUrl,
          spotify_url: spotifyUrl,
          apple_music_url: appleMusicUrl,
          credits,
          process_description: processDescription,
          demos,
          publish: true
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold">Create New Song</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Music Fields */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Music Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Art URL</label>
              <input
                type="text"
                value={coverArtUrl}
                onChange={(e) => setCoverArtUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spotify URL</label>
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apple Music URL</label>
              <input
                type="text"
                value={appleMusicUrl}
                onChange={(e) => setAppleMusicUrl(e.target.value)}
                placeholder="https://music.apple.com/..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Credits</label>
              <textarea
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="Producer: ..., Featured Artist: ..."
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Process Description</label>
              <textarea
                value={processDescription}
                onChange={(e) => setProcessDescription(e.target.value)}
                placeholder="Tell the story of how you made this song..."
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={6}
              />
            </div>
          </div>

          {/* Demos */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Earlier Demos</h2>

            {demos.length > 0 && (
              <div className="mb-6 space-y-3">
                {demos.map((demo, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded flex justify-between items-start">
                    <div>
                      <p className="font-medium">{demo.name}</p>
                      <p className="text-sm text-gray-600">{demo.date}</p>
                      <p className="text-sm text-blue-600 truncate">{demo.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDemo(idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 bg-gray-50 rounded">
              <div>
                <label className="block text-sm font-medium mb-2">Demo Name</label>
                <input
                  type="text"
                  value={newDemo.name}
                  onChange={(e) => setNewDemo({ ...newDemo, name: e.target.value })}
                  placeholder="e.g., First Demo, Version 2..."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Demo Link</label>
                <input
                  type="text"
                  value={newDemo.url}
                  onChange={(e) => setNewDemo({ ...newDemo, url: e.target.value })}
                  placeholder="https://soundcloud.com/... or https://open.spotify.com/..."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date (optional)</label>
                <input
                  type="text"
                  value={newDemo.date}
                  onChange={(e) => setNewDemo({ ...newDemo, date: e.target.value })}
                  placeholder="e.g., January 2024"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={handleAddDemo}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              >
                Add Demo
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Publish Song'}
            </button>
            <Link href="/admin" className="text-blue-600 hover:underline py-2">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
