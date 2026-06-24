import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (slug) {
      const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).not('published_at', 'is', null).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase.from('posts').select('*').not('published_at', 'is', null).order('published_at', { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { title, slug, content, media_type, description, publish } = body;
    if (!title || !slug) return NextResponse.json({ error: 'Title and slug required' }, { status: 400 });
    const { data, error } = await supabase.from('posts').insert([{ title, slug, author_id: userId, content: content || '', media_type: media_type || 'text', media_urls: [], description: description || '', published_at: publish ? new Date().toISOString() : null }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
