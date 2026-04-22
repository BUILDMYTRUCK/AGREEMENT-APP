import Link from "next/link";
import NewContractForm from "./NewContractForm";
import { AGREEMENT_CLAUSES, AGREEMENT_TITLE, SHOP_NAME } from "@/lib/agreement";

export const dynamic = "force-dynamic";

export default function NewContractPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          &larr; Back
        </Link>
        <span className="text-sm text-slate-500">{SHOP_NAME}</span>
      </div>

      <h1 className="text-2xl font-semibold">{AGREEMENT_TITLE}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fill in the customer information, review the terms together, then hand
        over the device for the customer to sign.
      </p>

      <NewContractForm clauses={AGREEMENT_CLAUSES} />
    </div>
  );
}
