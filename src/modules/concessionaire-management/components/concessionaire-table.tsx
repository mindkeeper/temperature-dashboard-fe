import { Eye } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Concessionaire } from "../types/concessionaire-management.types";

interface ConcessionaireTableProps {
  concessionaires: Concessionaire[];
}

export function ConcessionaireTable({ concessionaires }: ConcessionaireTableProps) {
  const navigate = useNavigate();

  if (concessionaires.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">No concessionaires found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Warehouses</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {concessionaires.map((concessionaire) => (
          <TableRow key={concessionaire.id}>
            <TableCell className="font-medium">{concessionaire.name}</TableCell>
            <TableCell>{concessionaire.address}</TableCell>
            <TableCell>{concessionaire.warehouses.length}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => void navigate(`/concessionaires/${concessionaire.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
