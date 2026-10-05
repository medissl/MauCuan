-- MauCuan initial schema. All monetary amounts are integer rupiah.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Teman' check (char_length(nickname) between 1 and 60),
  pet_name text not null default 'Miko' check (char_length(pet_name) between 1 and 40),
  opening_balance bigint not null default 0 check (opening_balance between 0 and 9000000000000),
  onboarding_complete boolean not null default false,
  reduce_motion boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  amount bigint not null check (amount between 1 and 9000000000000),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  occurred_on date not null,
  receipt_path text,
  created_at timestamptz not null default now(),
  check (receipt_path is null or split_part(receipt_path,'/',1)=user_id::text)
);
create index transactions_owner_date on public.transactions(user_id,occurred_on desc);
create unique index transactions_receipt_once on public.transactions(user_id,receipt_path) where receipt_path is not null;
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  target_amount bigint not null check (target_amount between 1 and 9000000000000),
  target_date date,
  created_at timestamptz not null default now(),
  unique(id,user_id)
);
create index goals_owner on public.goals(user_id);
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid not null,
  amount bigint not null check (amount between 1 and 9000000000000),
  created_at timestamptz not null default now(),
  foreign key(goal_id,user_id) references public.goals(id,user_id) on delete cascade
);
create index contributions_owner_goal on public.contributions(user_id,goal_id);
create table public.checkins (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  no_spend boolean not null,
  created_at timestamptz not null default now(),
  primary key(user_id,day)
);
create table public.pet_accessories (
  user_id uuid not null references public.profiles(id) on delete cascade,
  accessory text not null check (accessory in ('bandana','explorer_hat')),
  cost integer not null check (cost in (0,80)),
  created_at timestamptz not null default now(),
  primary key(user_id,accessory)
);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.contributions enable row level security;
alter table public.checkins enable row level security;
alter table public.pet_accessories enable row level security;
revoke all on public.profiles,public.transactions,public.goals,public.contributions,public.checkins,public.pet_accessories from anon,authenticated;
grant select on public.profiles,public.transactions,public.goals,public.contributions,public.checkins,public.pet_accessories to authenticated;
grant update(nickname,pet_name,reduce_motion) on public.profiles to authenticated;
grant insert,update,delete on public.transactions to authenticated;
grant insert,update on public.goals to authenticated;

create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_edit on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy transactions_read on public.transactions for select to authenticated using ((select auth.uid())=user_id);
create policy transactions_add on public.transactions for insert to authenticated with check ((select auth.uid())=user_id);
create policy transactions_edit on public.transactions for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy transactions_remove on public.transactions for delete to authenticated using ((select auth.uid())=user_id);
create policy goals_read on public.goals for select to authenticated using ((select auth.uid())=user_id);
create policy goals_add on public.goals for insert to authenticated with check ((select auth.uid())=user_id);
create policy goals_edit on public.goals for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy contributions_read on public.contributions for select to authenticated using ((select auth.uid())=user_id);
create policy checkins_read on public.checkins for select to authenticated using ((select auth.uid())=user_id);
create policy accessories_read on public.pet_accessories for select to authenticated using ((select auth.uid())=user_id);

-- Profile provisioning is an internal trigger, never an exposed RPC.
create function private.provision_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id) values(new.id);
  insert into public.pet_accessories(user_id,accessory,cost) values(new.id,'bandana',0);
  return new;
end $$;
revoke all on function private.provision_user() from public,anon,authenticated;
create trigger maucuan_user_created after insert on auth.users for each row execute function private.provision_user();

-- All financial mutations lock the owner profile so allocations cannot race spending.
create function private.lock_financial_owner() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  perform 1 from public.profiles where id=coalesce(new.user_id,old.user_id) for update;
  return coalesce(new,old);
end $$;
revoke all on function private.lock_financial_owner() from public,anon,authenticated;
create trigger transactions_owner_lock before insert or update or delete on public.transactions for each row execute function private.lock_financial_owner();

create function private.complete_onboarding(p_nickname text,p_pet_name text,p_opening_balance bigint) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  update public.profiles set nickname=trim(p_nickname),pet_name=trim(p_pet_name),opening_balance=p_opening_balance,onboarding_complete=true
  where id=uid and onboarding_complete=false;
  if not found then raise exception 'Onboarding already completed'; end if;
end $$;
create function private.daily_checkin(p_no_spend boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); today date:=(now() at time zone 'Asia/Jakarta')::date; added integer;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_no_spend is null then raise exception 'Choose a check-in type'; end if;
  if p_no_spend and exists(select 1 from public.transactions where user_id=uid and kind='expense' and occurred_on=today) then
    raise exception 'Pengeluaran hari ini sudah tercatat. Pilih review catatan.';
  end if;
  insert into public.checkins(user_id,day,no_spend) values(uid,today,p_no_spend) on conflict do nothing;
  get diagnostics added=row_count;
  return jsonb_build_object('rewarded',added=1,'xp',case when added=1 then 20 else 0 end,'leaves',case when added=1 then 10 else 0 end);
end $$;
create function private.allocate_savings(p_goal_id uuid,p_amount bigint) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); available numeric;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_amount is null or p_amount<1 then raise exception 'Nominal harus lebih dari nol'; end if;
  perform 1 from public.profiles where id=uid for update;
  if not exists(select 1 from public.goals where id=p_goal_id and user_id=uid) then raise exception 'Target tidak ditemukan'; end if;
  select p.opening_balance+coalesce((select sum(case when kind='income' then amount else -amount end) from public.transactions where user_id=uid),0)-coalesce((select sum(amount) from public.contributions where user_id=uid),0)
  into available from public.profiles p where id=uid;
  if p_amount>available then raise exception 'Dana bebas tidak cukup'; end if;
  insert into public.contributions(user_id,goal_id,amount) values(uid,p_goal_id,p_amount);
end $$;
create function private.redeem_accessory(p_accessory text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); available bigint;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_accessory is null or p_accessory<>'explorer_hat' then raise exception 'Aksesori tidak tersedia'; end if;
  perform 1 from public.profiles where id=uid for update;
  if exists(select 1 from public.pet_accessories where user_id=uid and accessory=p_accessory) then return; end if;
  select (select count(*)*10 from public.checkins where user_id=uid)-coalesce((select sum(cost) from public.pet_accessories where user_id=uid),0) into available;
  if available<80 then raise exception 'Daun belum cukup'; end if;
  insert into public.pet_accessories(user_id,accessory,cost) values(uid,p_accessory,80);
end $$;
revoke all on function private.complete_onboarding(text,text,bigint),private.daily_checkin(boolean),private.allocate_savings(uuid,bigint),private.redeem_accessory(text) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.complete_onboarding(text,text,bigint),private.daily_checkin(boolean),private.allocate_savings(uuid,bigint),private.redeem_accessory(text) to authenticated;
create function public.complete_onboarding(p_nickname text,p_pet_name text,p_opening_balance bigint) returns void language sql security invoker set search_path='' as $$select private.complete_onboarding(p_nickname,p_pet_name,p_opening_balance)$$;
create function public.daily_checkin(p_no_spend boolean) returns jsonb language sql security invoker set search_path='' as $$select private.daily_checkin(p_no_spend)$$;
create function public.allocate_savings(p_goal_id uuid,p_amount bigint) returns void language sql security invoker set search_path='' as $$select private.allocate_savings(p_goal_id,p_amount)$$;
create function public.redeem_accessory(p_accessory text) returns void language sql security invoker set search_path='' as $$select private.redeem_accessory(p_accessory)$$;
revoke all on function public.complete_onboarding(text,text,bigint),public.daily_checkin(boolean),public.allocate_savings(uuid,bigint),public.redeem_accessory(text) from public,anon,authenticated;
grant execute on function public.complete_onboarding(text,text,bigint),public.daily_checkin(boolean),public.allocate_savings(uuid,bigint),public.redeem_accessory(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('receipts','receipts',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy receipts_read on storage.objects for select to authenticated using (bucket_id='receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy receipts_add on storage.objects for insert to authenticated with check (bucket_id='receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy receipts_remove on storage.objects for delete to authenticated using (bucket_id='receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
