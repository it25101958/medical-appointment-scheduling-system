"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm mr-5 text-muted-foreground font-medium">
        Page {currentPage + 1} of {totalPages}
      </p>
      <div className="flex items-center justify-between px-4 bg-card flex-wrap gap-2">
        {/* Left side: Previous / Next buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>

        {/* Right side: Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page size:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Page Size" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
