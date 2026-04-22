import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AGREEMENT_CLAUSES, AGREEMENT_TITLE } from "@/lib/agreement";
import { generateContractPdf } from "@/lib/pdf";
import { isAuthenticated } from "@/lib/session";

interface CreatePayload {
  customerName?: string;
  companyName?: string | null;
  vehicleMakeModel?: string;
  signatureDataUrl?: string;
}

function plainAgreementText(): string {
  return [
    AGREEMENT_TITLE,
    "",
    ...AGREEMENT_CLAUSES.flatMap((c) => [c.heading, c.body, ""]),
  ].join("\n");
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const customerName = body.customerName?.trim() ?? "";
  const companyName = body.companyName?.trim() || null;
  const vehicleMakeModel = body.vehicleMakeModel?.trim() ?? "";
  const signatureDataUrl = body.signatureDataUrl ?? "";

  if (!customerName || !vehicleMakeModel) {
    return NextResponse.json(
      { error: "Customer name and vehicle are required." },
      { status: 400 },
    );
  }
  if (!signatureDataUrl.startsWith("data:image/png;base64,")) {
    return NextResponse.json(
      { error: "A signature is required." },
      { status: 400 },
    );
  }

  const h = await headers();
  const signerIp =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null;
  const signerUserAgent = h.get("user-agent") ?? null;

  const signedAt = new Date();

  const contract = await prisma.contract.create({
    data: {
      customerName,
      companyName,
      vehicleMakeModel,
      agreementText: plainAgreementText(),
      signatureDataUrl,
      signedAt,
      signerIp,
      signerUserAgent,
    },
    select: { id: true },
  });

  // Generate PDF and store bytes so it's always retrievable for legal use.
  const pdf = await generateContractPdf({
    id: contract.id,
    customerName,
    companyName,
    vehicleMakeModel,
    signedAt,
    signatureDataUrl,
    signerIp,
  });

  await prisma.contract.update({
    where: { id: contract.id },
    data: { pdfBytes: Buffer.from(pdf) },
  });

  return NextResponse.json({ id: contract.id });
}
