import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }

    if (slug) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      title, slug, description, content, media_type,
      cover_art_url, spotify_url, apple_music_url,
      credits, process_description, demos, publish
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title, slug, author_id: userId,
        content: content || '',
        media_type: media_type || 'audio',
        description: description || '',
        cover_art_url: cover_art_url || null,
        spotify_url: spotify_url || null,
        apple_music_url: apple_music_url || null,
        credits: credits || null,
        process_description: process_description || null,
        demos: demos || [],
        published_at: publish ? new Date().toISOString() : null
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: updates.title,
        slug: updates.slug,
        description: updates.description || '',
        media_type: updates.media_type || 'audio',
        cover_art_url: updates.cover_art_url || null,
        spotify_url: updates.spotify_url || null,
        apple_music_url: updates.apple_music_url || null,
        credits: updates.credits || null,
        process_description: updates.process_description || null,
        demos: updates.demos || []
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
