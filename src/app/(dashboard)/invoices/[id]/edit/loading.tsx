import { Bone } from "~/components/Shimmer";

export default function EditInvoiceLoading() {
  return (
    <div>
      <div className="mb-6">
        <Bone className="mb-4 h-4 w-32" />
        <Bone className="h-7 w-48" />
        <Bone className="mt-2 h-4 w-56" />
      </div>

      <div className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        {/* Client info fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Bone className="mb-1.5 h-4 w-24" />
              <Bone className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <Bone className="mb-1.5 h-4 w-16" />
          <Bone className="h-20 w-full rounded-lg" />
        </div>

        {/* Line items */}
        <div>
          <Bone className="mb-3 h-4 w-24" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Bone className="h-10 flex-1 rounded-lg" />
                <Bone className="h-10 w-20 rounded-lg" />
                <Bone className="h-10 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <Bone className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
