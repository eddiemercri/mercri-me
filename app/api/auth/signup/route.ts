import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const username = email.split('@')[0];

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: password, username }])
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
    }

    return NextResponse.json({ user: { id: data.id, email: data.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
