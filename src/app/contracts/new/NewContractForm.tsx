"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

interface Clause {
  heading: string;
  body: string;
}

export default function NewContractForm({ clauses }: { clauses: Clause[] }) {
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [sigEmpty, setSigEmpty] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vehicleMakeModel, setVehicleMakeModel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!customerName.trim() && !!vehicleMakeModel.trim() && !sigEmpty;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);

    const signatureDataUrl = sigRef.current
      ?.getCanvas()
      .toDataURL("image/png");

    if (!signatureDataUrl) {
      setError("Could not read signature. Please sign again.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          companyName: companyName.trim() || null,
          vehicleMakeModel: vehicleMakeModel.trim(),
          signatureDataUrl,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Failed to save agreement.");
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/contracts/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      {/* Customer info card */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Customer information
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 sm:col-span-1">
            Customer name <span className="text-red-500">*</span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-1">
            Company name <span className="text-slate-400">(optional)</span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Vehicle (make / model)<span className="text-red-500"> *</span>
            <input
              required
              value={vehicleMakeModel}
              onChange={(e) => setVehicleMakeModel(e.target.value)}
              placeholder="e.g. 2019 Ford F-250"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Date and time of signing are recorded automatically.
        </p>
      </section>

      {/* Agreement text */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Terms of service
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-800">
          {clauses.map((c) => (
            <div key={c.heading}>
              <h3 className="font-semibold">{c.heading}</h3>
              <p className="mt-1 text-slate-700">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Signature */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Customer signature
          </h2>
          <button
            type="button"
            onClick={() => {
              sigRef.current?.clear();
              setSigEmpty(true);
            }}
            className="text-sm text-slate-500 underline hover:text-slate-900"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          By signing below, you acknowledge that you have read and agree to the
          terms above.
        </p>
        <div className="mt-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
          <SignatureCanvas
            ref={sigRef}
            penColor="#0f172a"
            onEnd={() => setSigEmpty(sigRef.current?.isEmpty() ?? true)}
            canvasProps={{
              className: "w-full h-48 rounded-xl",
              "aria-label": "Signature pad",
            }}
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white shadow-sm disabled:opacity-40"
        >
          {submitting ? "Saving…" : "Agree & save"}
        </button>
      </section>
    </form>
  );
}
