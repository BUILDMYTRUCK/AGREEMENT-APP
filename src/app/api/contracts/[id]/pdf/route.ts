import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/session";
import { generateContractPdf } from "@/lib/pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let bytes: Uint8Array;
  if (contract.pdfBytes && contract.pdfBytes.length > 0) {
    bytes = new Uint8Array(contract.pdfBytes);
  } else {
    bytes = await generateContractPdf({
      id: contract.id,
      customerName: contract.customerName,
      companyName: contract.companyName,
      vehicleMakeModel: contract.vehicleMakeModel,
      signedAt: contract.signedAt,
      signatureDataUrl: contract.signatureDataUrl,
      signerIp: contract.signerIp,
    });
  }

  const filename = `agreement-${contract.customerName.replace(/\W+/g, "-")}-${contract.id}.pdf`;

  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
