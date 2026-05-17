"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, RefreshCcw, Star } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { FeedbackForm, feedbackApi, type FeedbackResponse } from "@/features/feedback";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface CurrentUser {
  userId: number;
  firstName?: string;
  lastName?: string;
  roleType: number;
}

export default function PatientFeedbackPage() {
  const [patient, setPatient] = useState<CurrentUser | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, []);

  const loadFeedback = useCallback(async (patientId = patient?.userId) => {
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
  }, [patient?.userId]);

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

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Patient feedback
          </div>
          <h1 className="text-2xl font-semibold">Share Appointment Feedback</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Submit feedback for a completed appointment using your appointment
            and doctor IDs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadFeedback()}
          disabled={!patient?.userId || isLoading}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {patient?.userId ? (
        <FeedbackForm
          patientId={patient.userId}
          onCreated={() => loadFeedback(patient.userId)}
        />
      ) : (
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading your patient profile...
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            My Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading feedback...</p>
          ) : feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No feedback submitted yet.
            </p>
          ) : (
            feedback.map((item) => (
              <div
                key={item.feedbackId}
                className="rounded-md border border-border/60 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">
                      Appointment #{item.appointmentId} with {item.doctorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status: {item.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-current" />
                    {item.rating}/5
                  </div>
                </div>
                {item.comments && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.comments}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
