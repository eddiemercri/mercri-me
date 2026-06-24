'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
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
  const [mediaType, setMediaType] = useState('audio');
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [credits, setCredits] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [demos, setDemos] = useState<Demo[]>([]);
  const [newDemo, setNewDemo] = useState({ name: '', url: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = Date.now() + '-' + Math.random().toString(36).substring(7) + '.' + fileExt;
    const filePath = folder + '/' + fileName;

    const { error } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile(file, 'covers');
      setCoverArtUrl(url);
    } catch (err) {
      alert('Failed to upload cover: ' + (err instanceof Error ? err.message : ''));
    }
    setUploadingCover(false);
  };

  const handleDemoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDemo(true);
    try {
      const url = await uploadFile(file, 'demos');
      setNewDemo({ ...newDemo, url });
    } catch (err) {
      alert('Failed to upload demo: ' + (err instanceof Error ? err.message : ''));
    }
    setUploadingDemo(false);
  };

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
      alert('Error: ' + (error instanceof Error ? error.message : 'Failed'));
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

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Cover Art</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="block"
            />
            {uploadingCover && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
            {coverArtUrl && (
              <div className="mt-4">
                <img src={coverArtUrl} alt="Cover" className="w-48 h-48 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Music Links</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Spotify URL</label>
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Apple Music URL</label>
              <input
                type="text"
                value={appleMusicUrl}
                onChange={(e) => setAppleMusicUrl(e.target.value)}
                placeholder="https://music.apple.com/..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
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

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Earlier Demos</h2>

            {demos.length > 0 && (
              <div className="mb-6 space-y-3">
                {demos.map((demo, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{demo.name}</p>
                        <p className="text-sm text-gray-600">{demo.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDemo(idx)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <audio controls src={demo.url} className="w-full mt-2" />
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
                <label className="block text-sm font-medium mb-2">Demo Audio File (MP3, WAV, etc.)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleDemoUpload}
                  className="block"
                />
                {uploadingDemo && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
                {newDemo.url && <p className="text-sm text-green-600 mt-2">File uploaded!</p>}
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
                disabled={!newDemo.name || !newDemo.url}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
              >
                Add Demo
              </button>
            </div>
          </div>

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
