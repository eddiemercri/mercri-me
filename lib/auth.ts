import * as bcrypt from 'bcryptjs';

export async function signUp(email: string, username: string, password: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password_hash: hashedPassword, role: 'user' })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    
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
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    
    let user = null;
    if (Array.isArray(data) && data.length > 0) {
      user = data[0];
    } else if (data && data.email) {
      user = data;
    }
    
    if (!user) throw new Error('User not found');
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new Error('Invalid password');
    
    const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_role', user.role);
    return { success: true, user };
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
