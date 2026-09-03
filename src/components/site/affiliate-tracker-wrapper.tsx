import { Suspense } from "react";
import { AffiliateTracker } from "./affiliate-tracker";

/**
 * Server component wrapper that allows AffiliateTracker to use useSearchParams
 * inside a Suspense boundary (required by Next.js 16).
 */
export function AffiliateTrackerWrapper() {
  return (
    <Suspense fallback={null}>
      <AffiliateTracker />
    </Suspense>
  );
}
