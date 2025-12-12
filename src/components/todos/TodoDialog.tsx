"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { format } from "date-fns";
import { upsertTodoSchema, type UpsertTodoInput } from "@/lib/validation/todo";
import type { TodoStatus } from "@/types/todo";

const statusOptions: { label: string; value: TodoStatus }[] = [
  { label: "Backlog", value: "BACKLOG" },
  { label: "Pending", value: "PENDING" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" }
];

type Props = {
  open: boolean;
  initialValues?: UpsertTodoInput;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: UpsertTodoInput) => void;
};

export function TodoDialog({ open, initialValues, isSaving, onClose, onSave }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<UpsertTodoInput>({
    resolver: zodResolver(upsertTodoSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      status: "PENDING" as TodoStatus
    }
  });

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { title: "", description: "", status: "PENDING" as TodoStatus });
    }
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValues?.id ? "Edit todo" : "Create todo"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            label="Duration (hours)"
            type="number"
            {...register("duration")}
            error={!!errors.duration}
            helperText={errors.duration?.message}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Status"
                value={field.value ?? "PENDING"}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                error={!!errors.status}
                helperText={errors.status?.message}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <TextField
                type="date"
                label="Due date"
                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                onChange={(event) =>
                  field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                }
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: field.value ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear due date"
                        size="small"
                        onClick={() => field.onChange(undefined)}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined
                }}
                error={!!errors.dueDate}
                helperText={errors.dueDate?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSave)} disabled={isSaving}>
          {initialValues?.id ? "Save changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
