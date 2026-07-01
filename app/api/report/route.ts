import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Report ID required' }, { status: 400 });

  // Explicit allow-list — never select(*) here. This endpoint is public and
  // unauthenticated; email/phone/ip_address/notes/contacted/agency_signal are
  // internal CRM fields that must never be exposed to whoever holds the link.
  const { data, error } = await supabase
    .from('pingclose_audits')
    .select(`
      id, created_at, url,
      mobile_score, desktop_score, ttfb, lcp, fcp, cls, inp,
      total_page_size, total_requests, passes_one_second,
      pagespeed_duration_ms, pagespeed_status,
      cms, hosting, cdn, http_version, server_location,
      images_lazy_loaded, images_webp, largest_image_kb, render_blocking_scripts,
      top_issues, top_fixes, full_report
    `)
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  return NextResponse.json(data);
}
