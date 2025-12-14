"use client";

import { DatePicker } from "@mui/x-date-pickers";
import { MenuItem, Stack, TextField, IconButton, Tooltip } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import { Dispatch, SetStateAction } from "react";
import type { TodoFilterInput } from "@/lib/validation/todo";
import type { TodoStatus } from "@/types/todo";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Backlog", value: "BACKLOG" },
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
        size="small"
        label="Status"
        value={filters.status ?? ""}
        onChange={(event) => {
          const value = event.target.value as TodoStatus | "";
          setFilters((prev) => ({ ...prev, status: value || undefined, page: 1 }));
        }}
        sx={{ "& .MuiInputBase-root": { height: 40 } }}
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
        size="small"
        value={filters.search ?? ""}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, search: event.target.value || undefined, page: 1 }))
        }
        sx={{ "& .MuiInputBase-root": { height: 40 } }}
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ minWidth: 280 }} alignItems="center">
        <DatePicker
          label="Due start"
          value={filters.dueStart ?? null}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              dueStart: value ?? undefined,
              page: 1
            }))
          }
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              sx: { "& .MuiInputBase-root": { height: 40 } }
            }
          }}
        />
        <DatePicker
          label="Due end"
          value={filters.dueEnd ?? null}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              dueEnd: value ?? undefined,
              page: 1
            }))
          }
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              sx: { "& .MuiInputBase-root": { height: 40 } }
            }
          }}
        />
        {(filters.dueStart || filters.dueEnd) && (
          <Tooltip title="Clear dates">
            <IconButton
              size="small"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  dueStart: undefined,
                  dueEnd: undefined,
                  page: 1
                }))
              }
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
