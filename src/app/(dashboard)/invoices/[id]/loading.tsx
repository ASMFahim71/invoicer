import { Bone } from "~/components/Shimmer";

export default function InvoiceDetailLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Bone className="mb-3 h-4 w-32" />
          <div className="flex items-center gap-3">
            <Bone className="h-7 w-40" />
            <Bone className="h-5 w-16 rounded-full" />
          </div>
          <Bone className="mt-2 h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-24 rounded-lg" />
          <Bone className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Invoice Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {/* Invoice Header */}
        <div className="border-b border-neutral-800 bg-neutral-900/80 px-8 py-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Bone className="mb-2 h-3 w-12" />
              <Bone className="h-5 w-32" />
              <Bone className="mt-1.5 h-4 w-40" />
            </div>
            <div>
              <Bone className="mb-2 h-3 w-12" />
              <Bone className="h-5 w-36" />
              <Bone className="mt-1.5 h-4 w-44" />
            </div>
            <div className="text-right">
              <Bone className="ml-auto h-7 w-28" />
              <Bone className="ml-auto mt-2 h-4 w-36" />
              <Bone className="ml-auto mt-1.5 h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-8 py-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Description", "Qty", "Unit Price", "Total"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3">
                    <Bone className="h-4 w-44" />
                  </td>
                  <td className="py-3 text-center">
                    <Bone className="mx-auto h-4 w-8" />
                  </td>
                  <td className="py-3 text-right">
                    <Bone className="ml-auto h-4 w-16" />
                  </td>
                  <td className="py-3 text-right">
                    <Bone className="ml-auto h-4 w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 ml-auto w-full max-w-xs space-y-3">
            <div className="flex justify-between">
              <Bone className="h-4 w-16" />
              <Bone className="h-4 w-20" />
            </div>
            <div className="h-px bg-neutral-800" />
            <div className="flex justify-between">
              <Bone className="h-5 w-12" />
              <Bone className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
