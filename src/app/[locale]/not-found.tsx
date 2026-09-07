import { NotFoundContent } from "@/components/layout/not-found-content";

// Boundary for `notFound()` calls from a route inside `[locale]`.
// Unmatched URLs are served by `src/app/global-not-found.tsx` instead.
export default function NotFound() {
  return <NotFoundContent />;
}
