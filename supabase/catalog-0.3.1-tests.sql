-- Synthetic accounts only. All data rolls back.
begin;
insert into auth.users(id,email) values
('77777777-7777-4777-8777-777777777777','maucuan-level-test@example.invalid'),
('88888888-8888-4888-8888-888888888888','maucuan-year-test@example.invalid');
insert into public.checkins(user_id,day,no_spend) select '77777777-7777-4777-8777-777777777777',current_date-n,true from generate_series(1,180) n;
insert into public.checkins(user_id,day,no_spend) select '88888888-8888-4888-8888-888888888888',current_date-n,true from generate_series(1,390) n;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',true);
do $$begin
 begin perform public.redeem_accessory('laurel'); raise exception 'FAIL level 20 bypass at level 19'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 begin perform public.redeem_accessory('wall_studio'); raise exception 'FAIL level 40 bypass'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
reset role;
insert into public.checkins(user_id,day,no_spend) select '77777777-7777-4777-8777-777777777777',current_date-n,true from generate_series(181,190) n;
set local role authenticated;
select public.redeem_accessory('laurel');
select public.redeem_accessory('wall_aurora');
select public.redeem_accessory('wall_aurora');
select public.equip_pet_item('head','laurel');
select public.equip_pet_item('wall','wall_aurora');
do $$begin
 if (select cost from public.pet_accessories where user_id=auth.uid() and accessory='laurel')<>0 then raise exception 'FAIL gift charged'; end if;
 if (select sum(cost) from public.pet_accessories where user_id=auth.uid())<>260 then raise exception 'FAIL duplicate purchase charge'; end if;
 if (select pet_room->>'wall' from public.profiles where id=auth.uid())<>'wall_aurora' then raise exception 'FAIL exclusive room persistence'; end if;
 begin perform public.redeem_accessory('moon_glasses'); raise exception 'FAIL higher level bypass'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims','{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated"}',true);
select public.redeem_accessory('wall_studio');
select public.redeem_accessory('royal_crown');
select public.equip_pet_item('wall','wall_studio');
select public.equip_pet_item('head','royal_crown');
do $$begin
 if (select pet_room->>'head' from public.profiles where id=auth.uid())<>'royal_crown' then raise exception 'FAIL year reward'; end if;
 if (select count(*) from public.pet_accessories where accessory='laurel')<>0 then raise exception 'FAIL ownership isolation'; end if;
end $$;
reset role;
insert into public.checkins(user_id,day,no_spend) select '88888888-8888-4888-8888-888888888888',current_date-n,true from generate_series(391,1180) n;
set local role authenticated;
do $$begin
 begin perform public.redeem_accessory('heart_crown'); raise exception 'FAIL level 120 bypass at level 119'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select public.redeem_accessory('wall_lighthouse');
reset role;
insert into public.checkins(user_id,day,no_spend) select '88888888-8888-4888-8888-888888888888',current_date-n,true from generate_series(1181,1190) n;
set local role authenticated;
select public.redeem_accessory('heart_crown');
select public.equip_pet_item('head','heart_crown');
do $$begin
 if (select pet_room->>'head' from public.profiles where id=auth.uid())<>'heart_crown' then raise exception 'FAIL 3-year gift'; end if;
 if (select cost from public.pet_accessories where user_id=auth.uid() and accessory='heart_crown')<>0 then raise exception 'FAIL long-term gift charged'; end if;
end $$;
reset role;
select 'PASS: 68 collectibles, half-year, year and 3-year locks, free gifts, server prices, duplicate charge, equip and ownership isolation' as result;
rollback;
