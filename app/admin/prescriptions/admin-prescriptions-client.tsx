"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { SearchBar } from "@/components/ui/search-bar";
import { PrescriptionList, PaginationControls } from "@/features/admin";

interface PrescriptionListItem {
  prescriptionId: number;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  status: string;
  createdAt: string;
}

interface Props {
  data: PrescriptionListItem[];
  currentPage: number;
  totalPages: number;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function AdminPrescriptionsClient({
  data,
  currentPage,
  totalPages,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredPrescriptions = useMemo(() => {
    const query = normalize(deferredSearchQuery);

    if (!query) return data;

    return data.filter((prescription) => {
      const haystack = [
        prescription.prescriptionId?.toString(),
        prescription.appointmentId?.toString(),
        prescription.patientName,
        prescription.doctorName,
        prescription.status,
        prescription.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data, deferredSearchQuery]);

  return (
    <>
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by patient, doctor, status, appointment, or prescription ID"
          resultCount={filteredPrescriptions.length}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <PrescriptionList data={filteredPrescriptions} showSearch={false} />

        <PaginationControls currentPage={currentPage} totalPages={totalPages} />
      </div>
    </>
  );
}
