import { Fragment } from "react";
import Link from "next/link";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";

/**
 * The visible trail and its BreadcrumbList markup, emitted together from one
 * list so they cannot drift apart — Google cross-checks the two and drops the
 * rich result when the markup describes a trail the page does not show.
 *
 * The last crumb is the current page: rendered as text, not a link, and
 * excluded from nothing — a self-referencing link adds no crawl path and
 * reads as a dead control.
 */
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const last = crumbs.length - 1;

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <Fragment key={c.path}>
            {i > 0 && (
              <span className="sep" aria-hidden="true">
                /
              </span>
            )}
            {i === last ? (
              <span aria-current="page">{c.name}</span>
            ) : (
              <Link href={c.path}>{c.name}</Link>
            )}
          </Fragment>
        ))}
      </nav>
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}
