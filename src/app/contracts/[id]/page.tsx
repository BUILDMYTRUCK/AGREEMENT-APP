import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AGREEMENT_CLAUSES, AGREEMENT_TITLE, SHOP_NAME } from "@/lib/agreement";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    select: {
      id: true,
      customerName: true,
      companyName: true,
      vehicleMakeModel: true,
      signedAt: true,
      signatureDataUrl: true,
      signerIp: true,
      signerUserAgent: true,
    },
  });

  if (!contract) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          &larr; All agreements
        </Link>
        <a
          href={`/api/contracts/${contract.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Download PDF
        </a>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-semibold">{AGREEMENT_TITLE}</h1>
            <p className="text-sm text-slate-500">{SHOP_NAME}</p>
          </div>
          <p className="text-xs text-slate-400">ID: {contract.id}</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Customer</dt>
            <dd className="font-medium">{contract.customerName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Company</dt>
            <dd className="font-medium">{contract.companyName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Vehicle</dt>
            <dd className="font-medium">{contract.vehicleMakeModel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Signed</dt>
            <dd className="font-medium">
              {contract.signedAt.toLocaleString()}
            </dd>
          </div>
        </dl>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Terms of service
        </h2>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-800">
          {AGREEMENT_CLAUSES.map((c) => (
            <div key={c.heading}>
              <h3 className="font-semibold">{c.heading}</h3>
              <p className="mt-1 text-slate-700">{c.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Signature
        </h2>
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contract.signatureDataUrl}
            alt={`Signature of ${contract.customerName}`}
            className="h-32 w-auto bg-white"
          />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500">
          <div>
            <dt>IP address</dt>
            <dd className="font-mono">{contract.signerIp ?? "unknown"}</dd>
          </div>
          <div>
            <dt>User agent</dt>
            <dd className="break-all">
              {contract.signerUserAgent ?? "unknown"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
