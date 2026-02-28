import { Bone } from "~/components/Shimmer";

export default function InvoicesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Bone className="h-7 w-36" />
          <Bone className="mt-2 h-4 w-56" />
        </div>
        <Bone className="h-9 w-32 rounded-lg" />
      </div>

      {/* Filter pills */}
      <div className="mb-5 flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <Bone key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50">
              {["Invoice", "Client", "Project", "Due Date", "Amount", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-900">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <Bone className="h-4 w-24" />
                  <Bone className="mt-1.5 h-3 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Bone className="h-4 w-28" />
                  <Bone className="mt-1.5 h-3 w-36" />
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Bone className="h-4 w-32" />
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <Bone className="h-4 w-24" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Bone className="ml-auto h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Bone className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-3">
                  <Bone className="ml-auto h-4 w-10" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
