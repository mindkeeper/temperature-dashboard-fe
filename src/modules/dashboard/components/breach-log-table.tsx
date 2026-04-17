import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type BreachEvent } from "@/services/breach-log";

import { useBreachLog } from "../hooks/use-breach-log";

interface BreachLogTableProps {
  concessId?: string;
}

const PAGE_SIZE = 5;

const columns: ColumnDef<BreachEvent>[] = [
  {
    accessorKey: "warehouseName",
    header: "Warehouse",
    cell: ({ row }) => <span className="font-medium">{row.getValue("warehouseName")}</span>,
  },
  {
    accessorKey: "startedAt",
    header: "Started",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDistanceToNow(new Date(row.getValue<string>("startedAt")), {
          addSuffix: true,
        })}
      </span>
    ),
  },
  {
    accessorKey: "durationMinutes",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue<number | null>("durationMinutes");
      return <span>{duration === null ? "Ongoing" : `${duration} min`}</span>;
    },
  },
  {
    id: "maxTemperature",
    header: "Max Temp",
    cell: ({ row }) => (
      <span className="text-red-600 dark:text-red-400">
        {row.original.maxTemperature}°{row.original.unit}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<BreachEvent["status"]>("status");
      return (
        <span
          className={
            status === "Active"
              ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300"
              : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
          }
        >
          {status}
        </span>
      );
    },
  },
];

export function BreachLogTable({ concessId }: BreachLogTableProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBreachLog({
    concessId,
    page,
    limit: PAGE_SIZE,
  });

  const events = data?.data ?? [];
  const pagination = data?.meta.pagination;

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 1,
  });

  const from = pagination ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = pagination ? Math.min(page * PAGE_SIZE, pagination.total) : 0;
  const total = pagination?.total ?? 0;

  const canPreviousPage = page > 1;
  const canNextPage = pagination ? page < pagination.totalPages : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Breach Log</CardTitle>
        <p className="text-muted-foreground text-sm">Recent temperature breach events</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">No breach events found</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-end gap-4">
              <p className="text-muted-foreground text-sm">
                {total === 0 ? "0 events" : `${from}–${to} of ${total} events`}
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => {
                        if (canPreviousPage) setPage((p) => p - 1);
                      }}
                      aria-disabled={!canPreviousPage}
                      className={!canPreviousPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => {
                        if (canNextPage) setPage((p) => p + 1);
                      }}
                      aria-disabled={!canNextPage}
                      className={!canNextPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
