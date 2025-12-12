"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Typography,
  type ChipProps
} from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import ListIcon from "@mui/icons-material/List";
import { type TodoDTO, type TodoStatus } from "@/types/todo";

type StatusMeta = {
  label: string;
  icon: typeof PauseCircleIcon;
  color: ChipProps["color"];
};

const statusMeta: Record<TodoStatus, StatusMeta> = {
  BACKLOG: { label: "Backlog", icon: ListIcon, color: "default" as const },
  PENDING: { label: "Pending", icon: PauseCircleIcon, color: "warning" as const },
  IN_PROGRESS: { label: "In Progress", icon: PlayCircleIcon, color: "info" as const },
  COMPLETED: { label: "Completed", icon: CheckCircleIcon, color: "success" as const }
};

type Props = {
  todos: TodoDTO[];
  onEdit: (todo: TodoDTO) => void;
  onDelete: (todo: TodoDTO) => void;
};

export function TodoList({ todos, onEdit, onDelete }: Props) {
  if (!todos.length) {
    return (
      <Card sx={{ border: "1px solid #202025" }}>
        <CardContent>
          <Typography>No todos yet. Create your first task!</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {todos.map((todo) => {
        const meta = statusMeta[todo.status] ?? statusMeta.PENDING;
        const Icon = meta.icon;
        return (
          <Card key={todo.id} sx={{ border: "1px solid #202025" }}>
            <CardHeader
              title={todo.title}
              subheader={todo.description}
              action={
                <Stack direction="row" spacing={1}>
                  <IconButton aria-label="edit" onClick={() => onEdit(todo)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => onDelete(todo)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
            />
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip icon={<Icon />} label={meta.label} color={meta.color} variant="outlined" />
                {todo.duration ? (
                  <Typography variant="body2" color="text.secondary">
                    {todo.duration}h
                  </Typography>
                ) : null}
                {todo.dueDate ? (
                  <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
                    Due {format(new Date(todo.dueDate), "PP")} ·
                    {" "}
                    {formatDistanceToNow(new Date(todo.dueDate), { addSuffix: true })}
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
