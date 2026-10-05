-- Run in the SQL editor as postgres. Everything rolls back: no test users remain.
begin;
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','maucuan-test-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','maucuan-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
select public.complete_onboarding('Test A','Miko',1000000);
insert into public.goals(id,user_id,title,target_amount) values('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Dana darurat',5000000);
insert into public.transactions(user_id,kind,amount,title,category,occurred_on) values('11111111-1111-4111-8111-111111111111','expense',100000,'Test','Lainnya',(now() at time zone 'Asia/Jakarta')::date);
select public.allocate_savings('33333333-3333-4333-8333-333333333333',250000);
do $$begin
 if (select count(*) from public.profiles)<>1 then raise exception 'FAIL profile isolation'; end if;
 if (select count(*) from public.contributions)<>1 then raise exception 'FAIL allocation'; end if;
 begin
  perform public.allocate_savings('33333333-3333-4333-8333-333333333333',800000);
  raise exception 'FAIL overspending accepted';
 exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 begin
  perform public.daily_checkin(true); raise exception 'FAIL no-spend accepted after spending';
 exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 if (public.daily_checkin(false)->>'rewarded')::boolean is not true then raise exception 'FAIL first reward'; end if;
 if (public.daily_checkin(false)->>'rewarded')::boolean is not false then raise exception 'FAIL duplicate reward'; end if;
 begin
  insert into public.checkins(user_id,day,no_spend) values(auth.uid(),current_date-1,true);
  raise exception 'FAIL direct checkin insert';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set opening_balance=9999999 where id=auth.uid();
  raise exception 'FAIL opening balance tampering';
 exception when insufficient_privilege then null; end;
 begin
  perform public.redeem_accessory('explorer_hat');raise exception 'FAIL unaffordable accessory';
 exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
do $$begin
 if (select count(*) from public.transactions)<>0 then raise exception 'FAIL transactions leak'; end if;
 if (select count(*) from public.goals)<>0 then raise exception 'FAIL goals leak'; end if;
 if (select count(*) from public.checkins)<>0 then raise exception 'FAIL rewards leak'; end if;
 if (select count(*) from public.contributions)<>0 then raise exception 'FAIL contributions leak'; end if;
 begin
  perform public.allocate_savings('33333333-3333-4333-8333-333333333333',1);raise exception 'FAIL cross-user goal';
 exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; end;
 begin
  insert into public.transactions(user_id,kind,amount,title,category,occurred_on) values('11111111-1111-4111-8111-111111111111','expense',1,'Attack','Lainnya',current_date);
  raise exception 'FAIL cross-user write';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$begin
 begin perform * from public.transactions;raise exception 'FAIL anon access';exception when insufficient_privilege then null;end;
 begin perform public.daily_checkin(false);raise exception 'FAIL anon reward';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: private records, ownership checks, allocation balance checks, opening-balance immutability, daily reward cap, accessory funds, anonymous access denied' as result;
rollback;
