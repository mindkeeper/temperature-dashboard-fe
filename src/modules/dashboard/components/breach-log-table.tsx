import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
];

export function BreachLogTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Breach Log</CardTitle>
        <p className="text-muted-foreground text-sm">Recent temperature breach events</p>
      </CardHeader>
      <CardContent>
        {MOCK_BREACH_EVENTS.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">No breach events found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Max Temp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BREACH_EVENTS.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.warehouseName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(event.startedAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell>{event.durationMinutes} min</TableCell>
                  <TableCell className="text-red-600 dark:text-red-400">
                    {event.maxTemperature}°{event.unit}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        event.status === "Active"
                          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
                      }
                    >
                      {event.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
