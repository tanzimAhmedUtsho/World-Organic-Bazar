import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({ where: { active: true }, orderBy: { district: "asc" } });
    return NextResponse.json({ zones: zones.map((zone) => ({ district: zone.district, deliveryFee: Number(zone.deliveryFee), freeThreshold: zone.freeThreshold ? Number(zone.freeThreshold) : null, estimatedDays: zone.estimatedDays, demo: zone.demo })) });
  } catch {
    return NextResponse.json({ error: "Delivery information is not available right now." }, { status: 503 });
  }
}
