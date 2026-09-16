import type { Provider } from "@/types";
import { ReviewCard } from "@/components/marketplace/review-card";
import { ReviewForm } from "@/components/reviews/review-form";
export function ProfileReviews({ provider }: { provider: Provider }) {
  return (
    <section id="opiniones" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="profile-section-title">Opiniones de familias</h2>
        {provider.reviewsCount > 0 && (
          <p className="text-sm text-muted">
            <strong className="text-lg text-brand">
              ★ {provider.rating.toFixed(1)}
            </strong>{" "}
            · {provider.reviewsCount}{" "}
            {provider.reviewsCount === 1 ? "opinión" : "opiniones"}
          </p>
        )}
      </div>
      {provider.reviews.length ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {provider.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-brand/25 bg-white p-6">
          <h3 className="text-lg font-bold">Todavía no hay opiniones</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sé la primera familia en compartir su experiencia.
          </p>
        </div>
      )}
      <div className="mt-7">
        <ReviewForm providerId={provider.id} providerName={provider.name} />
      </div>
    </section>
  );
}
