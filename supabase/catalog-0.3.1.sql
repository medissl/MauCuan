-- Additional catalog for MauCuan 0.3.1. Apply after enhancements.sql.
-- Idempotent additions only; existing ownership and server reward rules remain.
insert into public.pet_catalog(id,slot,cost,min_level) values
('wall_dawn','wall',55,1),
('wall_rain','wall',65,2),
('wall_library','wall',100,3),
('wall_ocean','wall',110,4),
('rug_checker','floor',45,1),
('rug_flower','floor',60,2),
('rug_moon','floor',90,3),
('cactus','left',35,1),
('monstera','left',65,2),
('mushroom_lamp','left',85,3),
('side_table','left',75,2),
('globe','right',80,2),
('clock','right',50,1),
('photo_frame','right',40,1),
('tea_set','right',70,2),
('paper_plane','toy',25,1),
('toy_fish','toy',45,2),
('star_pillow','toy',65,3),
('captain_hat','head',140,8),
('headphones','head',180,12),
('wizard_hat','head',240,18),
('laurel','head',0,20),
('moon_glasses','face',300,26),
('royal_crown','head',400,36),
('wall_garden','wall',0,10),
('aquarium','right',200,15),
('wall_aurora','wall',260,20),
('music_box','left',280,24),
('wall_observatory','wall',0,30),
('wall_studio','wall',0,40)
on conflict(id) do nothing;

-- Long-term collection: level 120 takes 1190 daily check-ins.
insert into public.pet_catalog(id,slot,cost,min_level) values
('telescope','right',450,45),
('wall_greenhouse','wall',0,50),
('pilot_hat','head',500,55),
('rug_orbit','floor',400,60),
('record_player','left',550,65),
('wall_treehouse','wall',0,70),
('astronaut_helmet','head',600,75),
('rocking_horse','toy',450,80),
('bonsai','right',600,85),
('wall_skyhouse','wall',0,90),
('rug_paw','floor',500,95),
('memory_chest','left',650,100),
('comet_crown','head',700,105),
('wall_lighthouse','wall',0,110),
('anniversary_mobile','right',750,115),
('heart_crown','head',0,120)
on conflict (id) do nothing;
