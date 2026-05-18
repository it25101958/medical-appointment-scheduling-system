"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MessageSquare,
  Plus,
  Star,
  Trash2,
  CalendarDays,
  Clock3,
  Eye,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  PageHeader,
  SearchBar,
  Textarea,
  type Column,
} from "@/components/ui";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { AppointmentDetailsDialog } from "@/features/appointments/components/appointment-details-dialog";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { appointmentApi } from "@/features/appointments/api/appointment.api";
import type { AppointmentResponse } from "@/features/appointments/types/appointment.types";
import { feedbackApi } from "@/features/feedback/api/feedback.api";
import type { FeedbackResponse } from "@/features/feedback/types/feedback.types";
import { apiRequest } from "@/lib/api-client";
import { highlightText } from "@/lib/highlight-search";
import { getErrorMessage } from "@/lib/utils";

interface CurrentUser {
  userId: number;
  firstName?: string;
  lastName?: string;
}

function toComparableDateTime(value: AppointmentResponse) {
  return new Date(
    `${value.appointmentDate}T${value.appointmentTime}`,
  ).getTime();
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function PatientVisitsPage() {
  const [patient, setPatient] = useState<CurrentUser | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponse | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackActionDialogOpen, setFeedbackActionDialogOpen] =
    useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"create" | "edit">("create");
  const [targetAppointment, setTargetAppointment] =
    useState<AppointmentResponse | null>(null);
  const [editingFeedback, setEditingFeedback] =
    useState<FeedbackResponse | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFeedback, setDeletingFeedback] =
    useState<FeedbackResponse | null>(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadVisits = useCallback(async (patientId?: number) => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      const data = await appointmentApi.getMyVisits(patientId);
      setAppointments(data || []);
    } catch (error) {
      toast.error("Could not load visits", {
        description: getErrorMessage(error),
      });
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFeedback = useCallback(async (patientId?: number) => {
    if (!patientId) return;

    setIsFeedbackLoading(true);
    try {
      const data = await feedbackApi.getByPatient(patientId);
      setFeedback(data || []);
    } catch (error) {
      toast.error("Could not load feedback", {
        description: getErrorMessage(error),
      });
      setFeedback([]);
    } finally {
      setIsFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadPatientAndVisits = async () => {
      try {
        const currentUser = await apiRequest<CurrentUser>("/users/me", {
          method: "GET",
          cache: "no-store",
        });

        setPatient(currentUser);
        await Promise.all([
          loadVisits(currentUser.userId),
          loadFeedback(currentUser.userId),
        ]);
      } catch (error) {
        toast.error("Could not load patient profile", {
          description: getErrorMessage(error),
        });
        setIsLoading(false);
        setIsFeedbackLoading(false);
      }
    };

    loadPatientAndVisits();
  }, [loadFeedback, loadVisits]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) => toComparableDateTime(b) - toComparableDateTime(a),
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return sortedAppointments;

    return sortedAppointments.filter((appointment) => {
      const haystack = [
        appointment.appointmentId?.toString(),
        appointment.appointmentNumber?.toString(),
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.appointmentType,
        appointment.status,
        appointment.doctorId?.toString(),
        appointment.doctor?.fullName,
        appointment.doctor?.specialization,
        appointment.room?.roomNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearchQuery, sortedAppointments]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));

  const paginatedAppointments = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredAppointments.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredAppointments, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [deferredSearchQuery, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  const feedbackByAppointment = useMemo(() => {
    const map = new Map<number, FeedbackResponse>();

    feedback.forEach((item) => {
      if (!map.has(item.appointmentId)) {
        map.set(item.appointmentId, item);
      }
    });

    return map;
  }, [feedback]);

  function openCreateFeedbackDialog(appointment: AppointmentResponse) {
    setTargetAppointment(appointment);
    setEditingFeedback(null);
    setFeedbackMode("create");
    setFeedbackRating(0);
    setFeedbackComments("");
    setFeedbackDialogOpen(true);
  }

  function openEditFeedbackDialog(
    appointment: AppointmentResponse,
    item: FeedbackResponse,
  ) {
    setTargetAppointment(appointment);
    setEditingFeedback(item);
    setFeedbackMode("edit");
    setFeedbackRating(item.rating);
    setFeedbackComments(item.comments || "");
    setFeedbackDialogOpen(true);
  }

  function openDeleteFeedbackDialog(item: FeedbackResponse) {
    setDeletingFeedback(item);
    setDeleteDialogOpen(true);
  }

  function openFeedbackActionDialog(
    appointment: AppointmentResponse,
    item: FeedbackResponse,
  ) {
    setTargetAppointment(appointment);
    setEditingFeedback(item);
    setFeedbackActionDialogOpen(true);
  }

  async function submitFeedback() {
    if (!patient || !targetAppointment || feedbackRating < 1) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      if (feedbackMode === "create") {
        await feedbackApi.create({
          appointmentId: targetAppointment.appointmentId,
          patientId: patient.userId,
          doctorId: targetAppointment.doctorId,
          rating: feedbackRating,
          comments: feedbackComments.trim() || undefined,
        });

        toast.success("Feedback submitted", {
          description: "Thank you for sharing your visit experience.",
        });
      } else if (editingFeedback) {
        await feedbackApi.update(editingFeedback.feedbackId, {
          rating: feedbackRating,
          comments: feedbackComments.trim() || undefined,
        });

        toast.success("Feedback updated", {
          description: "Your feedback has been updated.",
        });
      }

      setFeedbackDialogOpen(false);
      await loadFeedback(patient.userId);
    } catch (error) {
      toast.error(
        feedbackMode === "create"
          ? "Could not submit feedback"
          : "Could not update feedback",
        {
          description: getErrorMessage(error),
        },
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  async function deleteFeedback() {
    if (!deletingFeedback || !patient) return;

    setIsDeletingFeedback(true);
    try {
      await feedbackApi.remove(deletingFeedback.feedbackId);
      toast.success("Feedback deleted", {
        description: "Your feedback has been removed.",
      });
      setDeleteDialogOpen(false);
      setDeletingFeedback(null);
      await loadFeedback(patient.userId);
    } catch (error) {
      toast.error("Could not delete feedback", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsDeletingFeedback(false);
    }
  }

  const visitColumns: Column<AppointmentResponse>[] = [
    {
      header: "Appointment",
      render: (appointment) => (
        <div className="space-y-1">
          <p className="font-medium">
            {highlightText(
              `#${appointment.appointmentNumber}`,
              deferredSearchQuery,
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            ID #{appointment.appointmentId}
          </p>
        </div>
      ),
      className: "min-w-[160px] px-5 py-4",
    },
    {
      header: "Date & Time",
      render: (appointment) => (
        <div className="space-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            {appointment.appointmentDate}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock3 className="size-3.5" />
            {appointment.appointmentTime}
          </span>
        </div>
      ),
      className: "min-w-[170px] px-5 py-4",
    },
    {
      header: "Doctor",
      render: (appointment) =>
        highlightText(
          appointment.doctor?.fullName || `Doctor #${appointment.doctorId}`,
          deferredSearchQuery,
        ),
      className: "min-w-[220px] px-5 py-4 text-muted-foreground",
    },
    {
      header: "Type",
      render: (appointment) => (
        <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs">
          {appointment.appointmentType.replace("_", " ")}
        </Badge>
      ),
      className: "w-[170px] px-5 py-4",
    },
    {
      header: "Status",
      render: (appointment) => (
        <AppointmentStatusBadge status={appointment.status} />
      ),
      className: "w-[140px] px-5 py-4",
    },
    {
      header: "Actions",
      render: (appointment) => {
        const existingFeedback = feedbackByAppointment.get(
          appointment.appointmentId,
        );

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setSelectedAppointment(appointment)}
              aria-label="View visit details"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {existingFeedback ? (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  openFeedbackActionDialog(appointment, existingFeedback)
                }
                aria-label="View feedback"
                title="View feedback"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => openCreateFeedbackDialog(appointment)}
                aria-label="Add feedback"
                title="Add feedback"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      className: "w-[130px] px-5 py-4 text-center",
    },
  ];

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <PageHeader
        title="My Visits"
        description="Review your appointment history and open each visit to view full details."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadVisits(patient?.userId);
              loadFeedback(patient?.userId);
            }}
            disabled={!patient?.userId || isLoading || isFeedbackLoading}
            aria-label="Refresh visits"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by appointment, doctor, date, type, room, or status"
        resultCount={filteredAppointments.length}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading your visits...
          </div>
        ) : (
          <>
            <DataTable
              columns={visitColumns}
              data={paginatedAppointments}
              pageable={false}
              showActions={false}
              minWidth="1120px"
              emptyMessage="No visits found for your account."
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

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      <Dialog
        open={feedbackActionDialogOpen}
        onOpenChange={setFeedbackActionDialogOpen}
      >
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Feedback Actions
                  </DialogTitle>
                  <DialogDescription>
                    Choose what you want to do with your feedback.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="mx-6 rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-current" />
              {editingFeedback?.rating ?? 0}/5
              <span>- {editingFeedback?.status}</span>
            </div>
            {editingFeedback?.comments ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {editingFeedback.comments}
              </p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedbackActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (targetAppointment && editingFeedback) {
                  setFeedbackActionDialogOpen(false);
                  openEditFeedbackDialog(targetAppointment, editingFeedback);
                }
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (editingFeedback) {
                  setFeedbackActionDialogOpen(false);
                  openDeleteFeedbackDialog(editingFeedback);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[520px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Star className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {feedbackMode === "create" ? "Add Feedback" : "Edit Feedback"}
                  </DialogTitle>
                  <DialogDescription>
                    {feedbackMode === "create"
                      ? "Share your visit experience for this appointment."
                      : "Update your feedback. Backend edit rules still apply."}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-6">
            <div className="space-y-2">
              <Label className="form-label mb-0">Rating *</Label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    size="sm"
                    variant={feedbackRating === rating ? "default" : "outline"}
                    onClick={() => setFeedbackRating(rating)}
                  >
                    <Star
                      className={feedbackRating >= rating ? "fill-current" : ""}
                    />
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="form-label mb-0" htmlFor="visit-feedback-comments">
                Comments
              </Label>
              <Textarea
                id="visit-feedback-comments"
                maxLength={255}
                rows={4}
                placeholder="Tell us what went well or what could improve"
                value={feedbackComments}
                onChange={(event) => setFeedbackComments(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {feedbackComments.length}/255
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitFeedback}
              disabled={isSubmittingFeedback || feedbackRating < 1}
            >
              {feedbackMode === "create" ? "Submit" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <Trash2 className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Delete Feedback
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this feedback? This action cannot
                    be undone.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeletingFeedback}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteFeedback}
              disabled={isDeletingFeedback}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
