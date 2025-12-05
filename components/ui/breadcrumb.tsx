"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb component with Schema.org BreadcrumbList microdata
 *
 * Features:
 * - Automatic path-based breadcrumb generation
 * - Schema.org structured data for SEO
 * - ARIA labels for accessibility
 * - Responsive styling with Tailwind
 * - Does not render on homepage
 */

interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Converts a URL segment to a human-readable label
 */
function segmentToLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generates breadcrumb items from a pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
  ];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    items.push({
      label: segmentToLabel(segment),
      href: currentPath,
    });
  }

  return items;
}

export function Breadcrumb() {
  const pathname = usePathname();

  // Don't render breadcrumbs on homepage
  if (pathname === "/") {
    return null;
  }

  const items = generateBreadcrumbs(pathname);

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="py-3 px-4 text-sm"
    >
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex items-center flex-wrap gap-1"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const position = index + 1;

          return (
            <li
              key={item.href}
              itemScope
              itemProp="itemListElement"
              itemType="https://schema.org/ListItem"
              className="flex items-center"
            >
              {index === 0 ? (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span itemProp="name" className="sr-only">
                    {item.label}
                  </span>
                </Link>
              ) : isLast ? (
                <span
                  itemProp="item"
                  className="text-foreground font-medium"
                  aria-current="page"
                >
                  <span itemProp="name">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(position)} />

              {!isLast && (
                <ChevronRight
                  className="h-4 w-4 mx-2 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
