-- Apply after schema.sql. Backwards compatible with MauCuan 0.2.0.
create table public.pet_catalog (id text primary key, slot text not null check(slot in ('head','face','wall','floor','left','right','toy')), cost integer not null check(cost >= 0), min_level integer not null check(min_level > 0));
alter table public.pet_catalog enable row level security;
revoke all on public.pet_catalog from public,anon,authenticated;
grant select on public.pet_catalog to authenticated;
create policy pet_catalog_read on public.pet_catalog for select to authenticated using(true);
insert into public.pet_catalog(id,slot,cost,min_level) values ('explorer_hat','head',80,1),
('beret','head',60,1),
('sun_hat','head',90,2),
('party_hat','head',100,3),
('crown','head',0,5),
('round_glasses','face',60,1),
('star_glasses','face',120,4),
('wall_sky','wall',50,1),
('wall_peach','wall',50,1),
('wall_night','wall',0,3),
('rug_teal','floor',40,1),
('rug_sun','floor',75,2),
('rug_cloud','floor',0,2),
('plant','left',40,1),
('books','left',80,2),
('lamp','left',90,3),
('savings_jar','right',60,1),
('flower','right',70,2),
('trophy','right',0,4),
('ball','toy',30,1),
('yarn','toy',50,2),
('cushion','toy',80,3),
('bandana','face',0,1);
alter table public.pet_accessories drop constraint pet_accessories_accessory_check;
alter table public.pet_accessories drop constraint pet_accessories_cost_check;
alter table public.pet_accessories add constraint pet_accessories_catalog_fk foreign key(accessory) references public.pet_catalog(id);
alter table public.pet_accessories add constraint pet_accessories_cost_check check(cost between 0 and 10000);
alter table public.profiles add column pet_room jsonb not null default '{}'::jsonb check(jsonb_typeof(pet_room)='object');

create or replace function private.redeem_accessory(p_accessory text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); available bigint; price integer; required_level integer; current_level integer;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  perform 1 from public.profiles where id=uid for update;
  select cost,min_level into price,required_level from public.pet_catalog where id=p_accessory;
  if not found then raise exception 'Koleksi tidak tersedia'; end if;
  if exists(select 1 from public.pet_accessories where user_id=uid and accessory=p_accessory) then return; end if;
  select 1+floor(count(*)::numeric/10)::integer into current_level from public.checkins where user_id=uid;
  if current_level<required_level then raise exception 'Level belum cukup'; end if;
  select (select count(*)*10 from public.checkins where user_id=uid)-coalesce((select sum(cost) from public.pet_accessories where user_id=uid),0) into available;
  if available<price then raise exception 'Daun belum cukup'; end if;
  insert into public.pet_accessories(user_id,accessory,cost) values(uid,p_accessory,price);
end $$;

create function private.equip_pet_item(p_slot text,p_item text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_slot is null or p_slot not in ('head','face','wall','floor','left','right','toy') then raise exception 'Tempat koleksi tidak valid'; end if;
  perform 1 from public.profiles where id=uid for update;
  if p_item is null then
    update public.profiles set pet_room=pet_room-p_slot where id=uid;
  else
    if p_item='bandana' or not exists(select 1 from public.pet_catalog c join public.pet_accessories a on a.accessory=c.id where a.user_id=uid and c.id=p_item and c.slot=p_slot) then raise exception 'Koleksi belum dimiliki atau tempat tidak cocok'; end if;
    update public.profiles set pet_room=jsonb_set(pet_room,array[p_slot],to_jsonb(p_item),true) where id=uid;
  end if;
end $$;
revoke all on function private.equip_pet_item(text,text) from public,anon,authenticated;
grant execute on function private.equip_pet_item(text,text) to authenticated;
create function public.equip_pet_item(p_slot text,p_item text) returns void language sql security invoker set search_path='' as $$select private.equip_pet_item(p_slot,p_item)$$;
revoke all on function public.equip_pet_item(text,text) from public,anon,authenticated;
grant execute on function public.equip_pet_item(text,text) to authenticated;

create function private.valid_receipt_items(items jsonb) returns boolean language plpgsql immutable security invoker set search_path='' as $$
declare item jsonb; q numeric; a numeric;
begin
  if items is null or jsonb_typeof(items)<>'array' then return false; end if;
  if jsonb_array_length(items)>100 then return false; end if;
  for item in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(item)<>'object' or jsonb_typeof(item->'name') is distinct from 'string' or jsonb_typeof(item->'quantity') is distinct from 'number' or jsonb_typeof(item->'amount') is distinct from 'number' then return false; end if;
    if length(trim(item->>'name')) not between 1 and 100 then return false; end if;
    q:=(item->>'quantity')::numeric; a:=(item->>'amount')::numeric;
    if q<>floor(q) or q not between 1 and 999 or a<>floor(a) or a not between 1 and 9000000000000 then return false; end if;
  end loop;
  return true;
end $$;
revoke all on function private.valid_receipt_items(jsonb) from public,anon,authenticated;
grant execute on function private.valid_receipt_items(jsonb) to authenticated;
alter table public.transactions add column receipt_items jsonb not null default '[]'::jsonb constraint transactions_receipt_items_check check(private.valid_receipt_items(receipt_items));
notify pgrst,'reload schema';
