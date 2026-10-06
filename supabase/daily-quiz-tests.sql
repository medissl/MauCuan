-- Synthetic accounts only; no real account or transaction is touched.
begin;
insert into auth.users(id,email) values
('99999999-9999-4999-8999-999999999991','maucuan-quiz-test@example.invalid'),
('99999999-9999-4999-8999-999999999992','maucuan-quiz-other@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999991',true);
do $$declare s jsonb; again jsonb; q text; i integer; begin
 s:=public.daily_quiz(); again:=public.daily_quiz();
 if s->'question_ids'<>again->'question_ids' then raise exception 'FAIL reopen changed questions'; end if;
 if s->'question_ids'<> '["q001","q002","q003","q004","q005"]'::jsonb then raise exception 'FAIL first-day introduction'; end if;
 begin perform public.daily_quiz('q500',0); raise exception 'FAIL unrelated question accepted'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 begin perform public.daily_quiz('q002',0); raise exception 'FAIL out-of-order answer accepted'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 begin perform public.daily_quiz('q001',3); raise exception 'FAIL invalid choice accepted'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 for i in 0..4 loop q:=s->'question_ids'->>i; again:=public.daily_quiz(q,0); end loop;
 if (again->>'reward')::integer<>5 or (again->>'completed')::boolean is not true then raise exception 'FAIL completion'; end if;
 again:=public.daily_quiz('q005',2);
 if again->'answers'<> '[0,0,0,0,0]'::jsonb then raise exception 'FAIL retry changed stored answers'; end if;
 if (select sum(reward) from public.daily_quizzes)<>5 then raise exception 'FAIL duplicate reward'; end if;
 begin insert into public.daily_quizzes(user_id,day,question_ids) values(auth.uid(),current_date-1,array['q001','q002','q003','q004','q005']); raise exception 'FAIL direct insert'; exception when insufficient_privilege then null; end;
 begin update public.daily_quizzes set reward=5 where user_id=auth.uid(); raise exception 'FAIL direct update'; exception when insufficient_privilege then null; end;
 begin perform public.daily_quiz(null,null,current_date-2); raise exception 'FAIL backdated session'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999992',true);
do $$begin if (select count(*) from public.daily_quizzes)<>0 then raise exception 'FAIL cross-account read'; end if; end $$;
reset role;
-- Fund the first account using earned quiz rewards only, to verify redemption.
insert into public.daily_quizzes(user_id,day,question_ids,answers,completed,reward)
select '99999999-9999-4999-8999-999999999991',(now() at time zone 'Asia/Jakarta')::date-n,array['q001','q002','q003','q004','q005'],array[0,0,0,0,0]::smallint[],true,5 from generate_series(1,24) n;
set local role authenticated;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999991',true);
select public.redeem_accessory('plant');
select public.redeem_accessory('plant');
select public.equip_pet_item('left','plant');
do $$begin
 if (select cost from public.pet_accessories where accessory='plant')<>60 then raise exception 'FAIL authoritative price'; end if;
 if (select count(*) from public.pet_accessories where accessory='plant')<>1 then raise exception 'FAIL duplicate purchase'; end if;
 begin perform public.equip_pet_item('right','plant'); raise exception 'FAIL wrong decoration slot'; exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 if (select count(*) from public.checkins)<>0 then raise exception 'FAIL quiz grants XP'; end if;
end $$;
select public.redeem_accessory('cactus');
select public.equip_pet_item('left','cactus');
do $$begin if (select pet_room->>'left' from public.profiles where id=auth.uid())<>'cactus' then raise exception 'FAIL swap did not replace'; end if; end $$;
reset role;
-- Seed distinct recent questions, then verify the next selection excludes them.
delete from public.daily_quizzes where user_id='99999999-9999-4999-8999-999999999991';
insert into public.daily_quizzes(user_id,day,question_ids)
select '99999999-9999-4999-8999-999999999991',(now() at time zone 'Asia/Jakarta')::date-n,
array(select 'q'||lpad(i::text,3,'0') from generate_series((n-1)*5+1,n*5) i) from generate_series(1,7) n;
set local role authenticated;
do $$declare s jsonb; q text; begin
 s:=public.daily_quiz(); for q in select jsonb_array_elements_text(s->'question_ids') loop
 if substring(q from 2)::integer<=35 then raise exception 'FAIL weekly repeat'; end if;
 end loop;
end $$;
reset role;
select 'PASS: five answers, one reward, retries, ownership, invalid requests, quiz-funded purchase, slot constraints and weekly exclusion' as result;
rollback;

