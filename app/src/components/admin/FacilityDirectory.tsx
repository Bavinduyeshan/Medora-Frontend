"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState, Spinner } from "@/components/ui/Feedback";
export function FacilityDirectory() {
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState("");
  const query = useQuery({
    queryKey: ["facility-directory", page],
    queryFn: () => tenantsApi.list(page, 20),
  });
  return (
    <section className="space-y-4 border-t border-ink-200 pt-8">
      <h2 className="text-xl font-semibold">Facility directory</h2>
      <p className="text-sm text-ink-500">
        Find approved facility IDs for staff assignment.
      </p>
      {query.isLoading && <Spinner />}
      {query.error && (
        <ErrorState
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {query.data?.content.map((t) => (
          <div
            key={t.id}
            className="space-y-3 rounded-2xl border border-ink-100 bg-white p-5"
          >
            <div className="flex justify-between gap-3">
              <p className="font-semibold">{t.name}</p>
              <Badge tone={t.status === "APPROVED" ? "success" : "neutral"}>
                {t.status}
              </Badge>
            </div>
            <p className="break-all text-sm text-ink-500">{t.id}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(t.id);
                  setCopied(t.id);
                } catch {
                  setCopied("");
                }
              }}
            >
              {copied === t.id ? "Copied" : "Copy facility ID"}
            </Button>
          </div>
        ))}
      </div>
      {query.data && query.data.totalPages > 1 && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={query.data.first}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page + 1} of {query.data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={query.data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
