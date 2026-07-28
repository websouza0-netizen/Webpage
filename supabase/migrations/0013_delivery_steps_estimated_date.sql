-- Lets admins set a target completion date per delivery step, shown to the
-- client on their dashboard and mentioned in the step-completion email so
-- "mark done" carries a concrete timing reassurance, not just a status flip.
alter table delivery_steps add column estimated_date date;
