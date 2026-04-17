import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

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

interface BreachEvent {
  id: string;
  warehouseName: string;
  startedAt: Date;
  durationMinutes: number;
  maxTemperature: number;
  unit: string;
  status: "Resolved" | "Active";
}

// TODO: replace with real API when breach history endpoint is available
const MOCK_BREACH_EVENTS: BreachEvent[] = [
  {
    id: "1",
    warehouseName: "Warehouse A",
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 12 * 60 * 1000),
    durationMinutes: 14,
    maxTemperature: -8.3,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "2",
    warehouseName: "Warehouse B",
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    durationMinutes: 32,
    maxTemperature: -5.1,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "3",
    warehouseName: "Warehouse A",
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
    durationMinutes: 5,
    maxTemperature: -9.2,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "4",
    warehouseName: "Warehouse C",
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    durationMinutes: 21,
    maxTemperature: -7.8,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "5",
    warehouseName: "Warehouse B",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    durationMinutes: 8,
    maxTemperature: -9.9,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "6",
    warehouseName: "Warehouse A",
    startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    durationMinutes: 45,
    maxTemperature: -3.2,
    unit: "C",
    status: "Active",
  },
  {
    id: "7",
    warehouseName: "Warehouse C",
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    durationMinutes: 12,
    maxTemperature: -8.1,
    unit: "C",
    status: "Resolved",
  },
];

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
        {formatDistanceToNow(row.getValue<Date>("startedAt"), { addSuffix: true })}
      </span>
    ),
  },
  {
    accessorKey: "durationMinutes",
    header: "Duration",
    cell: ({ row }) => <span>{row.getValue<number>("durationMinutes")} min</span>,
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

const PAGE_SIZE = 5;

export function BreachLogTable() {
  const table = useReactTable({
    data: MOCK_BREACH_EVENTS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, totalRows);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Breach Log</CardTitle>
        <p className="text-muted-foreground text-sm">Recent temperature breach events</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_BREACH_EVENTS.length === 0 ? (
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

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {from}–{to} of {totalRows} events
              </p>
              <Pagination className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => {
                        table.previousPage();
                      }}
                      aria-disabled={!table.getCanPreviousPage()}
                      className={
                        !table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => {
                        table.nextPage();
                      }}
                      aria-disabled={!table.getCanNextPage()}
                      className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
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
