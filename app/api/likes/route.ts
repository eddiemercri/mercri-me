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
