import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_HOSTS = ["www.coursera.org", "coursera.org"];

function extractMeta(html: string, property: string): string | null {
  const m =
    html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"));
  return m ? m[1].trim() : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s*\|\s*Coursera\s*$/i, "").trim() : null;
}

function parseInstitution(desc: string | null): string | null {
  if (!desc) return null;
  const offered = desc.match(/offered by ([^.·|,]+)/i);
  if (offered) return offered[1].trim();
  const bullet = desc.match(/·\s*([^·]+)\s*·\s*Coursera/i);
  if (bullet) return bullet[1].trim();
  return null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { url?: string };
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(body.url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.json({ error: "Only Coursera certificate URLs are supported" }, { status: 400 });
  }

  if (!parsed.pathname.startsWith("/account/accomplishments/verify/")) {
    return NextResponse.json(
      { error: "URL must be a Coursera certificate verification link (/account/accomplishments/verify/...)" },
      { status: 400 }
    );
  }

  let html: string;
  try {
    const res = await fetch(body.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Coursera returned ${res.status}` }, { status: 502 });
    }
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Failed to reach Coursera. Check the URL and try again." }, { status: 502 });
  }

  const ogTitle = extractMeta(html, "og:title");
  const ogDescription = extractMeta(html, "og:description");
  const title = ogTitle ?? extractTitle(html);
  const institution = parseInstitution(ogDescription);

  return NextResponse.json({
    title,
    institution,
    credential_url: body.url,
    extracted: !!(title || institution),
    raw_og_description: ogDescription,
  });
}
