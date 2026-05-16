"use client";

import { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tableStyles } from "@/lib/theme";

interface StyledTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function StyledTable({
  headers,
  children,
  className,
  isLoading,
  emptyMessage = "No data found.",
}: StyledTableProps) {
  return (
    <ScrollArea className={`${tableStyles.container} ${className || ""}`}>
      <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow className={tableStyles.header}>
            {headers.map((header, idx) => (
              <TableHead key={idx} className={tableStyles.headerCell}>
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={headers.length}
                className={tableStyles.emptyState}
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

export function StyledTableRow({ children }: { children: ReactNode }) {
  return <TableRow className={tableStyles.row}>{children}</TableRow>;
}

export function StyledTableCell({ children }: { children: ReactNode }) {
  return <TableCell className={tableStyles.cell}>{children}</TableCell>;
}

export function StyledTableEmptyState({ message }: { message: string }) {
  const colSpan = 6;
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={tableStyles.emptyState}>
        {message}
      </TableCell>
    </TableRow>
  );
}
