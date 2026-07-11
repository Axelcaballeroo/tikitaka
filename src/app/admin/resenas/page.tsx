import { ReviewsManager } from "@/components/reviews/reviews-manager";
import { getAdminReviews } from "@/lib/data/reviews";
export const dynamic="force-dynamic";
export default async function ReviewsAdminPage(){const reviews=await getAdminReviews();return <ReviewsManager initialReviews={reviews}/>}
