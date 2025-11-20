"use client";

import { DatePicker } from "@mui/x-date-pickers";
import { MenuItem, Stack, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import type { TodoFilterInput } from "@/lib/validation/todo";
import type { TodoStatus } from "@/types/todo";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" }
];

type Props = {
  filters: TodoFilterInput;
  setFilters: Dispatch<SetStateAction<TodoFilterInput>>;
};

export function TodoFilters({ filters, setFilters }: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField
        select
        fullWidth
        label="Status"
        value={filters.status ?? ""}
        onChange={(event) => {
          const value = event.target.value as TodoStatus | "";
          setFilters((prev) => ({ ...prev, status: value || undefined }));
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.label} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Search"
        placeholder="Search title or description"
        fullWidth
        value={filters.search ?? ""}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, search: event.target.value || undefined }))
        }
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ minWidth: 280 }}>
        <DatePicker
          label="Due start"
          value={filters.dueStart ?? null}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              dueStart: value ?? undefined
            }))
          }
          slotProps={{ textField: { fullWidth: true } }}
        />
        <DatePicker
          label="Due end"
          value={filters.dueEnd ?? null}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              dueEnd: value ?? undefined
            }))
          }
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Stack>
    </Stack>
  );
}
