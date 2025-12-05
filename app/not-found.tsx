import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Not Found (404) page for the application.
 *
 * Displayed when a user navigates to a route that doesn't exist.
 * Provides helpful navigation options to get users back on track.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-muted-foreground/30">
            404
          </span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </h1>

        <p className="text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          It might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">View Documentation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
