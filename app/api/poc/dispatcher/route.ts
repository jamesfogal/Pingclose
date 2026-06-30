import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const startedAt = Date.now();

  // Insert test row — url='poc-test' marks it as a POC row, easy to find/delete
  const { data, error } = await supabase
    .from('pingclose_audits')
    .insert({ url: 'poc-test', email: 'poc-test@pingclose.com' })
    .select('id')
    .single();

  if (error || !data?.id) {
    console.error('POC_DISPATCHER: insert failed', error?.message);
    return NextResponse.json({ error: 'insert failed', detail: error?.message }, { status: 500 });
  }

  const reportId = data.id;
  console.log('POC_DISPATCHER: inserted row', reportId);

  // Fire agent AFTER response is sent — this is the mechanism we are proving
  after(async () => {
    console.log('POC_AFTER: calling agent for', reportId);
    const agentUrl = new URL('/api/poc/agent', req.url).toString();
    try {
      const res = await fetch(agentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      console.log('POC_AFTER: agent responded', res.status);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('POC_AFTER: agent call failed', msg);
    }
  });

  const elapsed = Date.now() - startedAt;
  console.log('POC_DISPATCHER: returning in', elapsed, 'ms');

  return NextResponse.json({ reportId, returnedAt: new Date().toISOString(), elapsedMs: elapsed });
}
