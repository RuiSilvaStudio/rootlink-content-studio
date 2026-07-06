/**
 * Fetches the published page for a given slug from Content Studio.
 * Returns its blocks array, or null if no page / Content Studio unreachable.
 */

type Block = {
  id?: string;
  blockType: string;
  eyebrow?: string | null;
  headline?: string;
  subhead?: string | null;
  image?: unknown;
  primaryCta?: { label?: string | null; href?: string | null };
  secondaryCta?: { label?: string | null; href?: string | null };
  heading?: string | null;
  body?: string;
  alignment?: string;
  imagePosition?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export async function fetchPageBlocks(slug: string): Promise<Block[] | null> {
  const base = process.env.NEXT_PUBLIC_CONTENT_STUDIO_URL || "http://localhost:3010";
  try {
    const res = await fetch(
      `${base}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&limit=1&depth=1`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const page = data?.docs?.[0];
    return page?.blocks || null;
  } catch {
    return null;
  }
}
