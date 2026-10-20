-- Run by CI right after schema.sql: each table takes a normal row, and made-up sources or regions are refused.
insert into visits (region, source, visitor) values ('US East', 'LinkedIn', gen_random_uuid());
insert into visits (region, source, visitor) values ('Buenos Aires', 'Other', gen_random_uuid());
insert into mileo_events (kind, food, region, visitor) values ('feed', 'bone', 'India', gen_random_uuid());
insert into notes (message, region, visitor) values ('hello', 'Somewhere', gen_random_uuid());
do $$ begin
  begin
    insert into visits (region, source, visitor) values ('UK', 'buy-pills.example', gen_random_uuid());
    raise exception 'a made-up source was accepted';
  exception when raise_exception then if sqlerrm <> 'Unknown source' then raise; end if;
  end;
  begin
    insert into notes (message, region, visitor) values ('x', 'Hello World', gen_random_uuid());
    raise exception 'a made-up region was accepted';
  exception when raise_exception then if sqlerrm <> 'Unknown region' then raise; end if;
  end;
end $$;
select visit_stats(), mileo_state();
