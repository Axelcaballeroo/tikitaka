export type Category = {
  slug: string; name: string; icon: string; description: string; color: string;
};

export type Provider = {
  id: string; slug: string; name: string; category: string; categorySlug: string;
  description: string; zone: string; city: string; rating: number; reviewsCount: number;
  priceFrom: number; verified: boolean; featured: boolean; image: string;
  services: string[]; coverage: string[]; schedule: string;
};
