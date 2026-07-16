import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getClientIp, verifyAdminAuth } from '@/lib/adminRateLimiter';

export async function GET(req: NextRequest) {
  const { ok, limited } = await verifyAdminAuth(getClientIp(req), req.headers.get('x-admin-password'));
  if (limited) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const filter = req.nextUrl.searchParams.get('filter');

  let query = supabase
    .from('pingclose_audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter === 'agency')      query = query.eq('agency_signal', true);
  if (filter === 'failing')     query = query.eq('passes_one_second', false);
  if (filter === 'new')         query = query.eq('pipeline_stage', 'new');
  if (filter === 'contacted')   query = query.eq('pipeline_stage', 'contacted');
  if (filter === 'appointment') query = query.eq('pipeline_stage', 'appointment');
  if (filter === 'quoted')      query = query.eq('pipeline_stage', 'quoted');
  if (filter === 'closed_won')  query = query.eq('pipeline_stage', 'closed_won');
  if (filter === 'closed_lost') query = query.eq('pipeline_stage', 'closed_lost');

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { ok, limited } = await verifyAdminAuth(getClientIp(req), req.headers.get('x-admin-password'));
  if (limited) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, pipeline_stage, notes } = await req.json();

  const updateData: Record<string, unknown> = { notes };

  if (pipeline_stage) {
    updateData.pipeline_stage = pipeline_stage;
    // Keep legacy contacted field in sync
    updateData.contacted = ['contacted','appointment','quoted','closed_won'].includes(pipeline_stage);
    if (pipeline_stage === 'contacted') {
      updateData.contacted_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from('pingclose_audits')
    .update(updateData)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
