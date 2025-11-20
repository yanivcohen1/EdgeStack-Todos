"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TodoFilters } from "@/components/todos/TodoFilters";
import { TodoList } from "@/components/todos/TodoList";
import { TodoDialog } from "@/components/todos/TodoDialog";
import { useSession, useLogout } from "@/hooks/useAuth";
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from "@/hooks/useTodos";
import { tokenStorage } from "@/lib/http/token-storage";
import type { TodoFilterInput, UpsertTodoInput } from "@/lib/validation/todo";
import type { TodoDTO } from "@/types/todo";

export default function TodoPage() {
  const [filters, setFilters] = useState<TodoFilterInput>({});
  const [dialogValues, setDialogValues] = useState<UpsertTodoInput | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TodoDTO | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const { mutateAsync: createTodo, isPending: isCreating } = useCreateTodo();
  const { mutateAsync: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const { mutateAsync: deleteTodo, isPending: isDeleting } = useDeleteTodo();
  const { mutateAsync: logout } = useLogout();

  const { data: todosData, isLoading: todosLoading } = useTodos(filters);

  const handleSave = async (values: UpsertTodoInput) => {
    if (values.id) {
      await updateTodo(values);
    } else {
      await createTodo(values);
    }
    setIsDialogOpen(false);
    setDialogValues(undefined);
  };

  const handleDeleteRequest = (todo: TodoDTO) => {
    setDeleteTarget(todo);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }
    await deleteTodo(deleteTarget.id);
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const openDialogForTodo = (todo?: TodoDTO) => {
    if (todo) {
      setDialogValues({
        id: todo.id,
        title: todo.title,
        description: todo.description ?? undefined,
        status: todo.status,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        tags: todo.tags
      });
    } else {
      setDialogValues(undefined);
    }
    setIsDialogOpen(true);
  };

  const hasToken = !!tokenStorage.getAccessToken();

  if ((!hasToken || sessionError) && !sessionLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh" spacing={2}>
        <Typography variant="h5">Please sign in to manage your todos.</Typography>
        <Button href="/login" variant="contained">
          Go to login
        </Button>
      </Stack>
    );
  }

  if (sessionLoading || !session) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh">
        <CircularProgress />
      </Stack>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <main>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
          <div>
            <Typography variant="h4" fontWeight={700}>
              Track status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin
                ? "Review every workspace todo, filter by date ranges, and keep tabs on team progress."
                : "Search your todos, filter by due ranges, and rely on MongoDB + MikroORM for persistence."}
            </Typography>
          </div>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={async () => await logout()}>
              Sign out
            </Button>
            <Button startIcon={<AddIcon />} onClick={() => openDialogForTodo()}>
              New todo
            </Button>
          </Stack>
        </Stack>

        <Box mt={4}>
          <TodoFilters filters={filters} setFilters={setFilters} />
        </Box>

        <Box mt={4}>
          {todosLoading ? (
            <Stack alignItems="center" py={6}>
              <CircularProgress />
            </Stack>
          ) : (
            <TodoList
              todos={todosData?.todos ?? []}
              onEdit={(todo) => openDialogForTodo(todo)}
              onDelete={handleDeleteRequest}
            />
          )}
        </Box>

        <Box mt={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Need inspiration?</Typography>
              <Typography variant="body2" color="text.secondary">
                Use filters to triage tasks rapidly, or tap New todo to capture work before it slips.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <TodoDialog
        open={isDialogOpen}
        initialValues={dialogValues}
        isSaving={isCreating || isUpdating}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogValues(undefined);
        }}
        onSave={handleSave}
      />

      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel} aria-labelledby="delete-todo-dialog-title">
        <DialogTitle id="delete-todo-dialog-title">Delete todo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${deleteTarget?.title ?? "this todo"}"? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting} autoFocus>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
