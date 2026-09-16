-- OPTIONAL, NOT EXECUTED. Review counts first; updates derived counters only.
-- Does not create, change moderation or delete any review.
begin;
with actual as (
  select p.id,count(r.id)::int as reviews_count,coalesce(round(avg(r.rating)::numeric,2),0) as rating
  from public.providers p left join public.reviews r on r.provider_id=p.id and r.published=true and r.status='approved'
  group by p.id
)
update public.providers p set rating=a.rating,reviews_count=a.reviews_count
from actual a where p.id=a.id and (p.rating is distinct from a.rating or p.reviews_count is distinct from a.reviews_count);
commit;
