"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Eye, MessageSquare, RefreshCcw, Star } from "lucide-react";
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
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import {
  FeedbackForm,
  feedbackApi,
  type FeedbackResponse,
} from "@/features/feedback";
import { apiRequest } from "@/lib/api-client";
import { highlightText } from "@/lib/highlight-search";
import { getErrorMessage } from "@/lib/utils";

interface CurrentUser {
  userId: number;
  firstName?: string;
  lastName?: string;
  roleType: number;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function PatientFeedbackPage() {
  const [patient, setPatient] = useState<CurrentUser | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    loadPatient();
  }, []);

  const loadFeedback = useCallback(
    async (patientId = patient?.userId) => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const data = await feedbackApi.getByPatient(patientId);
        setFeedback(data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load feedback"));
      } finally {
        setIsLoading(false);
      }
    },
    [patient?.userId],
  );

  useEffect(() => {
    if (patient?.userId) {
      loadFeedback(patient.userId);
    }
  }, [patient, loadFeedback]);

  async function loadPatient() {
    try {
      const currentUser = await apiRequest<CurrentUser>("/users/me", {
        method: "GET",
        cache: "no-store",
      });
      setPatient(currentUser);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load patient profile"));
      setIsLoading(false);
    }
  }

  const filteredFeedback = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return feedback;

    return feedback.filter((item) => {
      const haystack = [
        item.feedbackId?.toString(),
        item.appointmentId?.toString(),
        item.doctorName,
        item.rating?.toString(),
        item.status,
        item.comments,
        item.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearchQuery, feedback]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));

  const paginatedFeedback = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredFeedback.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredFeedback, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [deferredSearchQuery, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  const feedbackColumns: Column<FeedbackResponse>[] = [
    {
      header: "Feedback",
      render: (item) => (
        <div className="space-y-1">
          <p className="font-medium">
            {highlightText(`#${item.feedbackId}`, deferredSearchQuery)}
          </p>
          <p className="text-xs text-muted-foreground">
            Appointment #{item.appointmentId}
          </p>
        </div>
      ),
      className: "min-w-[160px] px-5 py-4",
    },
    {
      header: "Doctor",
      render: (item) =>
        highlightText(item.doctorName || "-", deferredSearchQuery),
      className: "min-w-[220px] px-5 py-4 text-muted-foreground",
    },
    {
      header: "Rating",
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Star className="size-4 fill-current" />
          {item.rating}/5
        </span>
      ),
      className: "w-[130px] px-5 py-4",
    },
    {
      header: "Status",
      render: (item) => (
        <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs">
          {item.status}
        </Badge>
      ),
      className: "w-[130px] px-5 py-4",
    },
    {
      header: "Created",
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
      className: "w-[150px] px-5 py-4",
    },
    {
      header: "Actions",
      render: (item) => (
        <div className="flex items-center justify-center">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => setSelectedFeedback(item)}
            aria-label="View feedback"
            title="View"
          >
            <Eye className="size-4" />
          </Button>
        </div>
      ),
      className: "w-[110px] px-5 py-4 text-center",
    },
  ];

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <PageHeader
        title="Share Appointment Feedback"
        description="Submit feedback for a completed appointment and review what you already shared."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFeedback()}
            disabled={!patient?.userId || isLoading}
            aria-label="Refresh feedback"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        }
      />

      {patient?.userId ? (
        <FeedbackForm
          patientId={patient.userId}
          onCreated={() => loadFeedback(patient.userId)}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            Loading your patient profile...
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by feedback, appointment, doctor, rating, status, or comments"
        resultCount={filteredFeedback.length}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading feedback...
          </div>
        ) : (
          <>
            <DataTable
              columns={feedbackColumns}
              data={paginatedFeedback}
              pageable={false}
              showActions={false}
              minWidth="980px"
              emptyMessage="No feedback submitted yet."
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={[5, 8, 10, 20]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(0);
              }}
            />
          </>
        )}
      </div>

      <Dialog
        open={Boolean(selectedFeedback)}
        onOpenChange={() => setSelectedFeedback(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[620px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Feedback Details
                  </DialogTitle>
                  <DialogDescription>
                    Review your submitted appointment feedback.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4 px-6 pb-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    Appointment #{selectedFeedback.appointmentId}
                  </h3>
                  <Badge variant="outline" className="rounded-full px-3 py-0.5">
                    {selectedFeedback.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedFeedback.doctorName}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoPanel
                  label="Rating"
                  value={`${selectedFeedback.rating}/5`}
                />
                <InfoPanel
                  label="Created"
                  value={
                    selectedFeedback.createdAt
                      ? new Date(selectedFeedback.createdAt).toLocaleString()
                      : "-"
                  }
                />
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Comments</p>
                <p className="text-sm">
                  {selectedFeedback.comments || "No comments added."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
