-- Ejecutar después de schema.sql. Seed idempotente de demostración.
insert into public.categories(name,slug,description,image_url) values
('Niñeras','nineras','Cuidado cercano y de confianza para cada familia.','https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85'),
('Jardines maternales','jardines-maternales','Espacios amorosos para sus primeros aprendizajes.','https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=85'),
('Salones de fiestas','salones-de-fiestas','Lugares preparados para celebrar a lo grande.','https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85'),
('Animadores','animadores','Juegos y aventuras para cumpleaños inolvidables.','https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=85'),
('Transporte escolar','transporte-escolar','Traslados cuidados, seguros y puntuales.','https://images.unsplash.com/photo-1501349800519-48093d60bde0?auto=format&fit=crop&w=1200&q=85'),
('Colonias','colonias','Días de movimiento, amistad y aire libre.','https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1200&q=85'),
('Clases particulares','clases-particulares','Acompañamiento personalizado para aprender mejor.','https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85'),
('Robótica','robotica','Tecnología, creatividad y desafíos para explorar.','https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=85'),
('Fotógrafos','fotografos','Recuerdos naturales de sus momentos más lindos.','https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=85'),
('Inflables','inflables','Juegos gigantes para saltar sin parar.','https://images.unsplash.com/photo-1509924603848-aca5e0027ab6?auto=format&fit=crop&w=1200&q=85'),
('Psicopedagogía','psicopedagogia','Apoyo profesional para aprender con bienestar.','https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=85'),
('Fonoaudiología','fonoaudiologia','Acompañamiento respetuoso en comunicación y lenguaje.','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85'),
('Estimulación temprana','estimulacion-temprana','Propuestas sensibles para acompañar su desarrollo.','https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85')
on conflict(slug) do update set name=excluded.name,description=excluded.description,image_url=excluded.image_url,active=true;

with seed(name,slug,category_slug,description,zone,rating,reviews_count,price,verified,featured,image) as (values
('Manos que Cuidan','manos-que-cuidan','nineras','Selección de niñeras con experiencia y referencias.','Palermo',4.9,48,8500,true,true,'photo-1544717305-2782549b5136'),
('Nani en Casa','nani-en-casa','nineras','Cuidado por horas y acompañamiento amoroso.','Belgrano',4.8,32,7800,true,false,'photo-1596461404969-9ae70f2830c1'),
('Jardín La Ronda','jardin-la-ronda','jardines-maternales','Un jardín donde jugar, explorar y crecer.','Villa Urquiza',4.9,63,180000,true,true,'photo-1503454537195-1dcabb73ffb9'),
('Casa Semilla','casa-semilla','jardines-maternales','Grupos reducidos y aprendizaje a través del juego.','Caballito',4.7,27,165000,true,false,'photo-1587654780291-39c9404d746b'),
('Fiesta Nube','fiesta-nube','salones-de-fiestas','Un salón luminoso que cuida cada detalle.','Villa Devoto',4.9,71,240000,true,true,'photo-1530103862676-de8c9debad1d'),
('Mini Mundo Eventos','mini-mundo-eventos','salones-de-fiestas','Celebraciones a medida para todas las edades.','San Isidro',4.6,39,210000,false,false,'photo-1513151233558-d860c5398176'),
('Club de Risas','club-de-risas','animadores','Juegos cooperativos, música y talleres creativos.','Almagro',4.8,44,45000,true,true,'photo-1527529482837-4698179dc6ce'),
('Tripulación Magia','tripulacion-magia','animadores','Magia, burbujas y personajes para cada grupo.','Recoleta',4.7,35,52000,true,false,'photo-1516627145497-ae6968895b74'),
('Ruta Kids','ruta-kids','transporte-escolar','Traslados escolares con seguimiento y puntualidad.','Núñez',4.8,55,95000,true,false,'photo-1501349800519-48093d60bde0'),
('Camino al Cole','camino-al-cole','transporte-escolar','Unidades habilitadas y comunicación diaria.','Colegiales',4.6,24,88000,true,false,'photo-1494526585095-c41746248156'),
('Club Verde','club-verde','colonias','Deporte, arte y naturaleza organizados por edades.','Parque Chas',4.9,46,145000,true,true,'photo-1472162072942-cd5147eb3902'),
('Verano en Ronda','verano-en-ronda','colonias','Pileta, juegos de equipo y talleres diarios.','Vicente López',4.7,31,155000,false,false,'photo-1500530855697-b586d89ba3ee'),
('Profe Cata','profe-cata','clases-particulares','Apoyo escolar personalizado con objetivos claros.','Recoleta',5,38,9000,true,true,'photo-1509062522246-3755977927d7'),
('Aprender Juntos','aprender-juntos','clases-particulares','Equipo docente para primaria y secundaria.','Boedo',4.7,21,7500,true,false,'photo-1503676260728-1c00da094a0b'),
('Robótica Play','robotica-play','robotica','Programación y robótica con proyectos reales.','Palermo',4.9,42,32000,true,true,'photo-1535378917042-10a22c95931a'),
('Código Curioso','codigo-curioso','robotica','Videojuegos, electrónica y pensamiento computacional.','Belgrano',4.8,19,28500,false,false,'photo-1516321318423-f06f85e504b3'),
('Luz de Infancia','luz-de-infancia','fotografos','Fotografía natural de cumpleaños y familias.','Chacarita',4.9,57,70000,true,true,'photo-1542038784456-1ea8e935640e'),
('Salta Salta','salta-salta','inflables','Inflables limpios y seguros para cada festejo.','San Isidro',4.6,28,60000,true,false,'photo-1509924603848-aca5e0027ab6'),
('Espacio Brote','espacio-brote','psicopedagogia','Acompañamiento integral para aprender con confianza.','Almagro',4.9,41,22000,true,true,'photo-1596464716127-f2a82984de30'),
('Hablar y Crecer','hablar-y-crecer','fonoaudiologia','Atención centrada en comunicación, lenguaje y vínculo.','Caballito',4.8,34,24000,true,false,'photo-1576091160399-112ba8d25d1d')
)
insert into public.providers(category_id,business_name,slug,description,zone,whatsapp,email,price_from,rating,reviews_count,verified,featured,published,status,cover_image,schedule,coverage,documents)
select c.id,s.name,s.slug,s.description,s.zone,'5491140000000','hola@tikitaka.com.ar',s.price,s.rating,s.reviews_count,s.verified,s.featured,true,'approved','https://images.unsplash.com/'||s.image||'?auto=format&fit=crop&w=1200&q=85','Lunes a sábados, 9 a 19 h',s.zone||', CABA',array['Identidad verificada','Datos de contacto revisados']
from seed s join public.categories c on c.slug=s.category_slug
on conflict(slug) do update set category_id=excluded.category_id,business_name=excluded.business_name,description=excluded.description,published=true,status='approved';

insert into public.provider_images(provider_id,image_url,sort_order)
select p.id,p.cover_image,0 from public.providers p where p.status='approved' and not exists(select 1 from public.provider_images i where i.provider_id=p.id and i.sort_order=0);
insert into public.provider_services(provider_id,title,description,price_from)
select p.id,'Atención personalizada','Propuesta adaptada a cada familia.',p.price_from from public.providers p where p.status='approved' and not exists(select 1 from public.provider_services s where s.provider_id=p.id and s.title='Atención personalizada');

with people(name,avatar,rating,comment,offset_days) as (values
('Mariana G.','https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',5,'Nos acompañaron con mucha calidez y profesionalismo.',21),
('Sofía R.','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',5,'Cumplieron todo lo acordado y los chicos quedaron felices.',52),
('Nicolás y Vale','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',5,'Se nota el cuidado en cada detalle. Los recomendamos.',83)
)
insert into public.reviews(provider_id,reviewer_name,reviewer_avatar,rating,comment,created_at)
select p.id,x.name,x.avatar,x.rating,x.comment,now()-(x.offset_days||' days')::interval from public.providers p cross join people x
where p.status='approved' and not exists(select 1 from public.reviews r where r.provider_id=p.id and r.reviewer_name=x.name);

update public.providers p set rating = stats.average, reviews_count = stats.total
from (select provider_id, round(avg(rating)::numeric, 2) as average, count(*)::int as total from public.reviews where published = true group by provider_id) stats
where p.id = stats.provider_id;
