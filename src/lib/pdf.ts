import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  AGREEMENT_CLAUSES,
  AGREEMENT_TITLE,
  SHOP_NAME,
} from "@/lib/agreement";

export interface ContractPdfInput {
  id: string;
  customerName: string;
  companyName?: string | null;
  vehicleMakeModel: string;
  signedAt: Date;
  signatureDataUrl: string; // "data:image/png;base64,..."
  signerIp?: string | null;
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  return Uint8Array.from(Buffer.from(match[1], "base64"));
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateContractPdf(
  input: ContractPdfInput,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612; // US letter
  const pageHeight = 792;
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  const maxChars = 95; // rough chars-per-line at 11pt Helvetica

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawLine = (
    text: string,
    opts: { size?: number; font?: typeof font; indent?: number } = {},
  ) => {
    const size = opts.size ?? 11;
    const f = opts.font ?? font;
    const indent = opts.indent ?? 0;
    if (y < margin + size + 4) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(text, {
      x: margin + indent,
      y: y - size,
      size,
      font: f,
      color: rgb(0, 0, 0),
    });
    y -= size + 4;
  };

  const gap = (px: number) => {
    y -= px;
  };

  // Header
  drawLine(SHOP_NAME, { size: 18, font: bold });
  drawLine(AGREEMENT_TITLE, { size: 14, font: bold });
  gap(6);
  drawLine(`Contract ID: ${input.id}`, { size: 9 });
  drawLine(`Date: ${input.signedAt.toLocaleString()}`, { size: 9 });
  gap(10);

  // Customer info
  drawLine("CUSTOMER INFORMATION", { size: 11, font: bold });
  drawLine(`Customer Name: ${input.customerName}`);
  if (input.companyName) drawLine(`Company: ${input.companyName}`);
  drawLine(`Vehicle (Make/Model): ${input.vehicleMakeModel}`);
  gap(10);

  // Clauses
  drawLine("TERMS OF SERVICE", { size: 11, font: bold });
  gap(4);
  for (const clause of AGREEMENT_CLAUSES) {
    drawLine(clause.heading, { font: bold });
    for (const line of wrap(clause.body, maxChars)) {
      drawLine(line);
    }
    gap(6);
  }

  // Signature block
  gap(14);
  if (y < margin + 180) {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
  drawLine("CUSTOMER SIGNATURE", { size: 11, font: bold });
  gap(6);

  const sigBytes = dataUrlToBytes(input.signatureDataUrl);
  if (sigBytes) {
    const sigImg = await doc.embedPng(sigBytes);
    const sigMaxW = contentWidth * 0.6;
    const sigMaxH = 80;
    const scale = Math.min(sigMaxW / sigImg.width, sigMaxH / sigImg.height, 1);
    const w = sigImg.width * scale;
    const h = sigImg.height * scale;
    y -= h;
    page.drawImage(sigImg, { x: margin, y, width: w, height: h });
    page.drawLine({
      start: { x: margin, y: y - 2 },
      end: { x: margin + sigMaxW, y: y - 2 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    y -= 16;
  }

  drawLine(`Signed by: ${input.customerName}`, { size: 10 });
  drawLine(`Signed at: ${input.signedAt.toLocaleString()}`, { size: 10 });
  if (input.signerIp) drawLine(`IP address: ${input.signerIp}`, { size: 9 });

  return doc.save();
}
