import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SHOP_NAME } from "@/lib/agreement";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const contracts = await prisma.contract.findMany({
    where: query
      ? {
          OR: [
            { customerName: { contains: query } },
            { companyName: { contains: query } },
            { vehicleMakeModel: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { signedAt: "desc" },
    take: 100,
    select: {
      id: true,
      customerName: true,
      companyName: true,
      vehicleMakeModel: true,
      signedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{SHOP_NAME}</h1>
          <p className="text-sm text-slate-500">Service agreements</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contracts/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            + New agreement
          </Link>
          <LogoutButton />
        </div>
      </header>

      <form className="mt-6" action="/">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by customer, company, or vehicle…"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {contracts.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {query
              ? `No agreements match "${query}".`
              : "No agreements yet. Create the first one."}
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Signed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.companyName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.vehicleMakeModel}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(c.signedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contracts/${c.id}`}
                      className="text-slate-900 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
