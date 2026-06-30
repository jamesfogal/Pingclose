import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { reportId } = await req.json();

  if (!reportId) {
    return NextResponse.json({ error: 'reportId required' }, { status: 400 });
  }

  console.log('POC_AGENT: sleeping 10s for', reportId);
  await new Promise(resolve => setTimeout(resolve, 10_000));

  const completedAt = new Date().toISOString();
  const { error } = await supabase
    .from('pingclose_audits')
    .update({ full_report: { poc_status: 'ok', completedAt } })
    .eq('id', reportId);

  if (error) {
    console.error('POC_AGENT: update failed', error.message);
    return NextResponse.json({ error: 'update failed', detail: error.message }, { status: 500 });
  }

  console.log('POC_AGENT: updated row', reportId, 'at', completedAt);
  return NextResponse.json({ ok: true, reportId, completedAt });
}
