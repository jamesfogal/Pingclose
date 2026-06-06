import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filter = req.nextUrl.searchParams.get('filter');

  let query = supabase
    .from('pingclose_audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter === 'agency') query = query.eq('agency_signal', true);
  if (filter === 'failing') query = query.eq('passes_one_second', false);
  if (filter === 'contacted') query = query.eq('contacted', true);
  if (filter === 'new') query = query.eq('contacted', false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, contacted, notes } = await req.json();

  const { error } = await supabase
    .from('pingclose_audits')
    .update({
      contacted,
      contacted_at: contacted ? new Date().toISOString() : null,
      notes
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
