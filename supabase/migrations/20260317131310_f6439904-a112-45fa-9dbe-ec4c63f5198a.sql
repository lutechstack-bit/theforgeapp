
create table public.homepage_hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  order_index integer default 0,
  is_active boolean default true,
  cohort_type text default 'FORGE',
  created_at timestamptz default now()
);

alter table public.homepage_hero_slides enable row level security;

create policy "Anyone can read active slides" on public.homepage_hero_slides for select using (is_active = true);
create policy "Admins can manage hero slides" on public.homepage_hero_slides for all using (has_role(auth.uid(), 'admin'::app_role)) with check (has_role(auth.uid(), 'admin'::app_role));

-- Seed sample slides using existing project images
insert into public.homepage_hero_slides (image_url, order_index) values
  ('/images/levelup/01.jpg', 0),
  ('/images/levelup/02.jpg', 1),
  ('/images/levelup/03.jpg', 2),
  ('/images/levelup/04.jpg', 3);
