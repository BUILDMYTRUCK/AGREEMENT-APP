-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "companyName" TEXT,
    "vehicleMakeModel" TEXT NOT NULL,
    "agreementText" TEXT NOT NULL,
    "signatureDataUrl" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signerIp" TEXT,
    "signerUserAgent" TEXT,
    "pdfBytes" BLOB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Contract_signedAt_idx" ON "Contract"("signedAt");

-- CreateIndex
CREATE INDEX "Contract_customerName_idx" ON "Contract"("customerName");
