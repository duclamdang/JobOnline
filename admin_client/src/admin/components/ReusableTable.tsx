import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import React from "react";

export interface Column<T> {
  key?: keyof T;
  title: string;
  render?: (row: T) => React.ReactNode;
}

interface ReusableTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
}

export function ReusableTable<T extends { id: number }>({
  columns,
  data,
}: ReusableTableProps<T>) {
  return (
    <Table sx={{ border: "1px solid #eee" }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f9fafb" }}>
          {columns.map((col, index) => (
            <TableCell key={col.key ? String(col.key) : `col-${index}`}>
              <b>{col.title}</b>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id} hover>
            {columns.map((col, index) => (
              <TableCell
                key={col.key ? String(col.key) : `cell-${row.id}-${index}`}
              >
                {col.render
                  ? col.render(row)
                  : col.key
                  ? String(row[col.key])
                  : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
