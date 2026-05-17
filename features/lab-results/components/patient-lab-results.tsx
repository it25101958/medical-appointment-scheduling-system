"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import { labResultApi } from "../api/lab-result.api";
import { LabResultResponse } from "../types/lab-result.types";

interface CurrentUser {
  userId: number;
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

export function PatientLabResults() {
  const [patient, setPatient] = useState<CurrentUser | null>(null);
  const [results, setResults] = useState<LabResultResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async (patientId = patient?.userId) => {
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
  }, [patient?.userId]);

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
    if (patient?.userId) {
      loadResults(patient.userId);
    }
  }, [patient, loadResults]);

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5" />
            Patient results
          </div>
          <h1 className="text-2xl font-semibold">My Lab Results</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review laboratory results recorded for your appointments.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!patient?.userId || loading}
          onClick={() => loadResults()}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading lab results...
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No lab results found.
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={result.id} className="border-border/60 bg-card/80">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {result.testName}
                      </h2>
                      <Badge
                        variant="outline"
                        className={getStatusClasses(result.status)}
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Appointment #{result.appointmentId}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.updatedAt
                      ? new Date(result.updatedAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">Result</p>
                    <p className="font-medium">{result.resultValue}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">
                      Reference Range
                    </p>
                    <p className="font-medium">{result.referenceRange}</p>
                  </div>
                </div>

                {result.remarks && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.remarks}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
