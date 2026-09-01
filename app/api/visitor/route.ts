import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const visitorId = randomUUID();
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await prisma.visitor.create({
    data: {
      visitorId,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      landingPage: typeof body.landingPage === "string" ? body.landingPage : null,
      utmSource: typeof body.utm_source === "string" ? body.utm_source : null,
      utmMedium: typeof body.utm_medium === "string" ? body.utm_medium : null,
      utmCampaign: typeof body.utm_campaign === "string" ? body.utm_campaign : null,
      utmTerm: typeof body.utm_term === "string" ? body.utm_term : null,
      utmContent: typeof body.utm_content === "string" ? body.utm_content : null,
      userAgent: req.headers.get("user-agent"),
      ipAddress,
    },
  });

  return NextResponse.json({ visitorId });
}
