"use client";

import { DragEvent } from "react";
import { Box, Card, CardContent, Chip, Container, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useTodos, useUpdateTodo } from "@/hooks/useTodos";
import { TodoStatus, TODO_STATUSES } from "@/types/todo";

export default function JiraPage() {
  const { data, isLoading } = useTodos({});
  const { mutate: updateTodo } = useUpdateTodo();
  const theme = useTheme();

  const handleDragStart = (e: DragEvent<HTMLDivElement>, todoId: string) => {
    e.dataTransfer.setData("todoId", todoId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: TodoStatus) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    if (todoId && data?.todos) {
      const todo = data.todos.find((t) => t.id === todoId);
      if (todo && todo.status !== status) {
        updateTodo({
          id: todo.id,
          title: todo.title,
          description: todo.description ?? undefined,
          status,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          tags: todo.tags
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: "100%" }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Scrum Board
      </Typography>
      <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
        {TODO_STATUSES.map((status) => (
          <Grid item xs={12} md={4} key={status} sx={{ height: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column"
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <Box
                p={2}
                borderBottom={`1px solid ${theme.palette.divider}`}
                bgcolor={theme.palette.background.paper}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" fontWeight={600}>
                  {status.replace("_", " ")}
                </Typography>
                <Chip
                  label={data?.todos.filter((t) => t.status === status).length || 0}
                  size="small"
                  color={status === "COMPLETED" ? "success" : status === "IN_PROGRESS" ? "info" : "default"}
                />
              </Box>
              <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
                <Stack spacing={2}>
                  {data?.todos
                    .filter((todo) => todo.status === status)
                    .map((todo) => (
                      <Card
                        key={todo.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, todo.id)}
                        sx={{
                          cursor: "grab",
                          "&:hover": { boxShadow: theme.shadows[4] },
                          transition: "box-shadow 0.2s"
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {todo.title}
                          </Typography>
                          {todo.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {todo.description}
                            </Typography>
                          )}
                          {todo.dueDate && (
                            <Typography variant="caption" display="block" mt={1} color="text.secondary">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
