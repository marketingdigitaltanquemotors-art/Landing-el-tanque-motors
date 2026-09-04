create table if not exists public.site_settings (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id text primary key,
  name text not null,
  year text not null,
  km text not null,
  fuel text not null,
  transmission text not null,
  price integer not null default 0 check (price >= 0),
  features text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_media (
  key text primary key,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  filename text,
  content_type text,
  size integer check (size is null or size >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_submissions (
  id text primary key,
  vehicle text not null,
  year text not null,
  price integer not null default 0 check (price >= 0),
  down integer not null default 20 check (down >= 0),
  months integer not null default 48 check (months >= 0),
  monthly integer not null default 0 check (monthly >= 0),
  date text not null,
  time text not null,
  name text not null,
  gmail text not null,
  phone text not null,
  initial text not null,
  timeline text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicle_media_vehicle
  on public.vehicle_media(vehicle_id, sort_order);

create index if not exists idx_lead_submissions_created
  on public.lead_submissions(created_at desc);

create index if not exists idx_lead_submissions_vehicle_date
  on public.lead_submissions(vehicle, date);

alter table public.site_settings enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_media enable row level security;
alter table public.lead_submissions enable row level security;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'vehicle-media',
  'vehicle-media',
  false,
  125829120,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
