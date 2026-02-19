insert into public.lessons (id, title, description, level, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'Preflop Fundamentals', 'Learn basic opening ranges and hand selection.', 1, 1),
  ('22222222-2222-2222-2222-222222222222', 'Position Advantage', 'Understand why acting last improves decisions.', 1, 2),
  ('33333333-3333-3333-3333-333333333333', 'Pot Odds Basics', 'Compare call cost against equity in common spots.', 2, 1)
on conflict (id) do nothing;

insert into public.questions (id, lesson_id, prompt, sort_order)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'From UTG in a full-ring game, which hand is usually an open-raise?', 1),
  ('aaaaaaa1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Which hand is generally folded preflop from early position?', 2),
  ('bbbbbbb1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Why is the button considered the best position?', 1),
  ('ccccccc1-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'You must call 20 chips to win a 100-chip pot. Minimum equity needed?', 1)
on conflict (id) do nothing;

insert into public.answers (question_id, answer_text, is_correct)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', 'AKo', true),
  ('aaaaaaa1-0000-0000-0000-000000000001', '74o', false),
  ('aaaaaaa1-0000-0000-0000-000000000001', 'J3o', false),

  ('aaaaaaa1-0000-0000-0000-000000000002', '22', false),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'T2o', true),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'AQs', false),

  ('bbbbbbb1-0000-0000-0000-000000000001', 'You act last postflop and gain more info.', true),
  ('bbbbbbb1-0000-0000-0000-000000000001', 'The blinds are smaller there.', false),
  ('bbbbbbb1-0000-0000-0000-000000000001', 'You can see everyone cards.', false),

  ('ccccccc1-0000-0000-0000-000000000001', '16.7%', true),
  ('ccccccc1-0000-0000-0000-000000000001', '50%', false),
  ('ccccccc1-0000-0000-0000-000000000001', '75%', false);
