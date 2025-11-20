"use client";

import { useState } from "react";
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TodoFilters } from "@/components/todos/TodoFilters";
import { TodoList } from "@/components/todos/TodoList";
import { TodoDialog } from "@/components/todos/TodoDialog";
import { useSession, useLogout } from "@/hooks/useAuth";
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from "@/hooks/useTodos";
import { tokenStorage } from "@/lib/http/token-storage";
import type { TodoFilterInput, UpsertTodoInput } from "@/lib/validation/todo";
import type { TodoDTO } from "@/types/todo";

export default function DashboardPage() {
  const [filters, setFilters] = useState<TodoFilterInput>({});
  const [dialogValues, setDialogValues] = useState<UpsertTodoInput | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const { mutateAsync: createTodo, isPending: isCreating } = useCreateTodo();
  const { mutateAsync: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const { mutateAsync: deleteTodo } = useDeleteTodo();
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

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
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
        <Typography variant="h5">Please sign in to access your dashboard.</Typography>
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

  return (
    <main id="main-section">
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
          <div>
            <Typography variant="h4" fontWeight={700}>
              Welcome back, {session.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track statuses, search todos, and filter by due ranges.
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

        <Box mt={4} id="todo-section">
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
              onDelete={handleDelete}
            />
          )}
        </Box>

        <Box mt={6} id="inter-section">
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Inter workspace</Typography>
              <Typography variant="body2" color="text.secondary">
                Centralize your teammate onboarding tasks and monitor their progress. This section is a placeholder for
                upcoming collaboration tooling.
              </Typography>
            </Stack>
          </Paper>
        </Box>

        <Box mt={3} id="admin-section">
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Admin console</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage roles, enforce rate limits, and review access logs. The dashboard sidebar links here to mimic the
                reference layout while the feature is still under construction.
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
    </main>
  );
}
