import type { ProviderReview } from "@/types";
import { ProfileImage } from "@/components/provider/profile-image";

export function ReviewCard({ review }: { review: ProviderReview }) {
  const date = new Date(review.date);
  const validDate = !Number.isNaN(date.getTime());
  const stars = Math.min(5, Math.max(0, Math.round(review.rating)));
  return (
    <article className="min-w-0 rounded-3xl border border-brand/10 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {review.avatar ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-mint">
              <ProfileImage
                src={review.avatar}
                alt={`Foto de ${review.author}`}
                sizes="40px"
              />
            </div>
          ) : (
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-sm font-bold text-brand"
            >
              {review.author.trim().slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            <p className="break-words text-sm font-extrabold">
              {review.author}
            </p>
            {validDate && (
              <time
                dateTime={date.toISOString()}
                className="mt-1 block text-xs text-muted"
              >
                {new Intl.DateTimeFormat("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(date)}
              </time>
            )}
          </div>
        </div>
        <p
          aria-label={`${review.rating} de 5 estrellas`}
          className="text-sm tracking-wide text-brand"
        >
          {"★".repeat(stars)}
          <span className="text-slate-300">{"☆".repeat(5 - stars)}</span>
        </p>
      </div>
      {review.comment && (
        <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-muted">
          {review.comment}
        </p>
      )}
    </article>
  );
}
