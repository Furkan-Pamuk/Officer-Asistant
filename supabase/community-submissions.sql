-- Run later, after connecting the intended Supabase project. Never run automatically.
-- Independent from legacy, device-only crew_posts; nothing is migrated/published.
create table if not exists public.community_submissions (
  id uuid primary key,
  author text not null check (char_length(author) between 1 and 80),
  title text not null check (char_length(title) between 1 and 140),
  body text not null default '' check (char_length(body) <= 2000),
  port text check (char_length(port) <= 100),
  photo_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  client_fingerprint text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  check (char_length(trim(body)) > 0 or photo_path is not null),
  check (photo_path is null or photo_path = id::text || '.jpg')
);
create index if not exists community_approved_date on public.community_submissions(created_at desc) where status = 'approved';
create index if not exists community_submission_rate on public.community_submissions(client_fingerprint,created_at);
alter table public.community_submissions enable row level security;

create or replace function public.is_community_moderator() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users where id = auth.uid()
    and lower(email) = 'admin@sharkapp.co' and email_confirmed_at is not null);
$$;
revoke all on function public.is_community_moderator() from public;
grant execute on function public.is_community_moderator() to anon, authenticated, service_role;

revoke all on public.community_submissions from anon, authenticated;
grant select(id,author,title,body,port,photo_path,status,created_at,reviewed_at,reviewed_by) on public.community_submissions to anon, authenticated;
grant update(status,reviewed_at,reviewed_by) on public.community_submissions to authenticated;
grant all on public.community_submissions to service_role;
create policy "community public approved" on public.community_submissions for select to anon, authenticated using (status = 'approved');
create policy "community moderator queue" on public.community_submissions for select to authenticated using (public.is_community_moderator());
create policy "community moderator review" on public.community_submissions for update to authenticated using (public.is_community_moderator()) with check (public.is_community_moderator());
-- No browser insert/delete policy: the server always assigns pending and enforces limits.

create or replace function public.submit_community_story(p_id uuid,p_author text,p_title text,p_body text,p_port text,p_photo_path text,p_fingerprint text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_fingerprint is null or p_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'invalid'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_fingerprint,0));
  if (select count(*) from public.community_submissions where client_fingerprint = p_fingerprint and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limit';
  end if;
  insert into public.community_submissions(id,author,title,body,port,photo_path,client_fingerprint,status)
    values(p_id,p_author,p_title,p_body,p_port,p_photo_path,p_fingerprint,'pending');
end;
$$;
revoke all on function public.submit_community_story(uuid,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_community_story(uuid,text,text,text,text,text,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('crew-wall-photos','crew-wall-photos',false,2097152,array['image/jpeg'])
on conflict(id) do nothing;
-- Pending/rejected photos are never public. Moderators can inspect the private originals.
create policy "community moderator photos" on storage.objects for select to authenticated
using (bucket_id = 'crew-wall-photos' and public.is_community_moderator());
