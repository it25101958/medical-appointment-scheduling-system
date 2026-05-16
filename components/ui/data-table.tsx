"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";

export type Column<T> = {
  header: string;
  accessor?: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  onView?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  pageable?: boolean;
  pageSize?: number;
  showActions?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  onView,
  emptyMessage = "No results found.",
  className,
  pageable = true,
  pageSize = 10,
  showActions = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIdx = currentPage * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedData = data.slice(startIdx, endIdx);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <Table className="min-w-[960px]" data-testid="data-table">
          <TableHeader>
            <TableRow className="bg-muted/45 hover:bg-muted/45">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={
                    col.className ||
                    "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  }
                >
                  {col.header}
                </TableHead>
              ))}
              {showActions && (
                <TableHead className="w-[72px] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rIdx) => (
                <TableRow
                  key={rIdx}
                  className="group transition-colors hover:bg-muted/25"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, cIdx) => (
                    <TableCell
                      key={cIdx}
                      className={col.className ?? "px-5 py-4 align-middle"}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                          ? String(row[col.accessor as string])
                          : null}
                    </TableCell>
                  ))}

                  {showActions && (
                    <TableCell className="px-5 py-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(row);
                            }}
                          >
                            <Info className="size-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {pageable && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
