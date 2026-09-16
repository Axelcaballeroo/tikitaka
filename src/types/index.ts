export type Category = {
  id?: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export type ProviderReview = {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};

export type ProviderFaq = { question: string; answer: string };

export type Provider = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  zone: string;
  city: string;
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  whatsapp: string;
  email?: string;
  verified: boolean;
  featured: boolean;
  image: string;
  gallery: string[];
  services: string[];
  serviceDetails?: ProviderService[];
  schedule: string;
  coverage: string[];
  documents: string[];
  reviews: ProviderReview[];
  faqs: ProviderFaq[];
  createdAt: string;
  published?: boolean;
  status?: "pending" | "approved" | "rejected";
};

export type ProviderRequestStatus = "Pendiente" | "Aprobado" | "Rechazado";

export type ProviderRequest = {
  id: string;
  businessName: string;
  category: string;
  zone: string;
  whatsapp: string;
  email: string;
  message: string;
  status: ProviderRequestStatus;
  verified: boolean;
  featured: boolean;
  createdAt: string;
};

export type LocalProvider = Provider & {
  sourceRequestId: string;
  published: boolean;
  local: true;
};
export type ProviderService = {
  title: string;
  description: string;
  priceFrom: number | null;
};
