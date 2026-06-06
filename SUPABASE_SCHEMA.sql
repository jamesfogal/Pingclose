-- PingClose Database Schema
-- Run this once in the Supabase SQL Editor for the localseoaeopro project

create table if not exists pingclose_audits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()),
  url text not null,
  email text not null,
  ip_address text,

  -- PageSpeed scores
  mobile_score integer,
  desktop_score integer,
  ttfb numeric,
  lcp numeric,
  fcp numeric,
  cls numeric,
  inp numeric,
  total_page_size integer,
  total_requests integer,

  -- Pass/fail
  passes_one_second boolean,

  -- Tech stack
  cms text,
  hosting text,
  cdn text,
  http_version text,
  server_location text,

  -- Image analysis
  images_lazy_loaded boolean,
  images_webp boolean,
  largest_image_kb integer,
  render_blocking_scripts integer,

  -- Top findings (stored as JSON)
  top_issues jsonb,
  top_fixes jsonb,

  -- Full raw report (stored as JSON)
  full_report jsonb,

  -- Admin tracking
  contacted boolean default false,
  contacted_at timestamp with time zone,
  notes text,

  -- Agency signal (soft IP flagging)
  agency_signal boolean default false
);

-- Index for fast admin dashboard queries
create index if not exists pingclose_audits_created_at_idx on pingclose_audits(created_at desc);
create index if not exists pingclose_audits_email_idx on pingclose_audits(email);
create index if not exists pingclose_audits_ip_idx on pingclose_audits(ip_address);

-- Enable Row Level Security
alter table pingclose_audits enable row level security;

-- Only service role can access (no public access)
create policy "Service role only" on pingclose_audits
  using (auth.role() = 'service_role');
