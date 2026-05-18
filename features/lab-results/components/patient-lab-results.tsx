"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  PageHeader,
  SearchBar,
  type Column,
} from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { highlightText } from "@/lib/highlight-search";
import { getErrorMessage } from "@/lib/utils";
import { labResultApi } from "../api/lab-result.api";
import { LabResultResponse } from "../types/lab-result.types";

interface CurrentUser {
  userId: number;
  patientId?: number;
  roleType: number;
}

function getStatusClasses(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "IN_PROGRESS") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function PatientLabResults() {
  const [patient, setPatient] = useState<CurrentUser | null>(null);
  const [results, setResults] = useState<LabResultResponse[]>([]);
  const [selectedResult, setSelectedResult] = useState<LabResultResponse | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadResults = useCallback(
    async (patientId = patient?.patientId || patient?.userId) => {
      if (!patientId) return;

      setLoading(true);
      try {
        const data = await labResultApi.getByPatient(patientId);
        setResults(data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load lab results"));
      } finally {
        setLoading(false);
      }
    },
    [patient?.patientId, patient?.userId],
  );

  useEffect(() => {
    async function loadPatient() {
      try {
        const currentUser = await apiRequest<CurrentUser>("/users/me", {
          method: "GET",
          cache: "no-store",
        });
        setPatient(currentUser);
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load patient profile"));
        setLoading(false);
      }
    }

    loadPatient();
  }, []);

  useEffect(() => {
    const patientId = patient?.patientId || patient?.userId;
    if (patientId) {
      loadResults(patientId);
    }
  }, [patient, loadResults]);

  const filteredResults = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return results;

    return results.filter((result) => {
      const haystack = [
        result.id?.toString(),
        result.appointmentId?.toString(),
        result.testName,
        result.resultValue,
        result.referenceRange,
        result.status,
        result.remarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearchQuery, results]);

  const columns: Column<LabResultResponse>[] = useMemo(
    () => [
      {
        header: "Result ID",
        render: (result) => highlightText(`#${result.id}`, deferredSearchQuery),
        className: "w-[130px] px-5 py-4 font-medium",
      },
      {
        header: "Appointment",
        render: (result) =>
          highlightText(`#${result.appointmentId}`, deferredSearchQuery),
        className: "w-[150px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Test",
        render: (result) =>
          highlightText(result.testName || "-", deferredSearchQuery),
        className: "min-w-[220px] px-5 py-4 font-medium",
      },
      {
        header: "Result",
        render: (result) =>
          highlightText(result.resultValue || "-", deferredSearchQuery),
        className: "min-w-[180px] px-5 py-4",
      },
      {
        header: "Reference",
        render: (result) =>
          highlightText(result.referenceRange || "-", deferredSearchQuery),
        className: "min-w-[180px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Status",
        render: (result) => (
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-0.5 text-xs ${getStatusClasses(
              result.status,
            )}`}
          >
            {result.status}
          </Badge>
        ),
        className: "w-[140px] px-5 py-4",
      },
      {
        header: "Actions",
        render: (result) => (
          <div className="flex items-center justify-center">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setSelectedResult(result)}
              aria-label="View lab result"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
        className: "w-[110px] px-5 py-4 text-center",
      },
    ],
    [deferredSearchQuery],
  );

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <PageHeader
        title="My Lab Results"
        description="Review laboratory results recorded for your appointments."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={!(patient?.patientId || patient?.userId) || loading}
            onClick={() => loadResults()}
            aria-label="Refresh lab results"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by result ID, appointment, test, value, range, or status"
        resultCount={filteredResults.length}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading lab results...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredResults}
            pageable
            pageSize={10}
            showActions={false}
            minWidth="1080px"
            emptyMessage="No lab results found."
          />
        )}
      </div>

      <Dialog
        open={Boolean(selectedResult)}
        onOpenChange={() => setSelectedResult(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[720px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Lab Result Details
                  </DialogTitle>
                  <DialogDescription>
                    Review your laboratory result information.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4 px-6 pb-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {selectedResult.testName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusClasses(selectedResult.status)}
                  >
                    {selectedResult.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Appointment #{selectedResult.appointmentId}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoPanel label="Result" value={selectedResult.resultValue} />
                <InfoPanel
                  label="Reference Range"
                  value={selectedResult.referenceRange}
                />
                <InfoPanel
                  label="Updated"
                  value={
                    selectedResult.updatedAt
                      ? new Date(selectedResult.updatedAt).toLocaleString()
                      : "-"
                  }
                />
                <InfoPanel
                  label="Result ID"
                  value={`#${selectedResult.id}`}
                />
              </div>

              {selectedResult.remarks && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="text-sm">{selectedResult.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoPanel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
