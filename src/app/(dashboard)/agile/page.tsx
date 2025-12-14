"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Container, Grid, Paper, Stack, Typography, useTheme, Button } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useTodos, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { TodoStatus, TODO_STATUSES } from "@/types/todo";
import { tokenStorage } from "@/lib/http/token-storage";
import { useSession } from "@/hooks/useAuth";
import { AgileTodoCard } from "./AgileTodoCard";

export default function AgilePage() {
  const { data, isLoading } = useTodos({});
  const { mutate: updateTodo } = useUpdateTodo();
  const { mutate: deleteTodo } = useDeleteTodo();
  const theme = useTheme();
  const { isLoading: sessionLoading, isError: sessionError } = useSession();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TodoStatus;
    const todo = data?.todos.find((t) => t.id === draggableId);

    if (todo && todo.status !== newStatus) {
      updateTodo({
        id: todo.id,
        title: todo.title,
        description: todo.description ?? undefined,
        status: newStatus,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        tags: todo.tags
      });
    }
  };

  if (isLoading || !isMounted) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

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

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: "100%" }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Task Board <small style={{ fontWeight: 1, fontSize: 15 }}> drag&drop</small>
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
          {TODO_STATUSES.map((status) => (
            <Grid item xs={12} md={3} key={status} sx={{ height: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  bgcolor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  flexDirection: "column"
                }}
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
                    color={
                      status === "COMPLETED"
                        ? "success"
                        : status === "IN_PROGRESS"
                        ? "info"
                        : status === "PENDING"
                        ? "warning"
                        : "default"
                    }
                  />
                </Box>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        overflowY: "auto",
                        bgcolor: snapshot.isDraggingOver ? theme.palette.action.hover : "transparent",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <Stack spacing={2}>
                        {data?.todos
                          .filter((todo) => todo.status === status)
                          .map((todo, index) => (
                            <Draggable key={todo.id} draggableId={todo.id} index={index}>
                              {(provided, snapshot) => (
                                <AgileTodoCard
                                  todo={todo}
                                  provided={provided}
                                  snapshot={snapshot}
                                  updateTodo={updateTodo}
                                  deleteTodo={deleteTodo}
                                />
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Stack>
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Container>
  );
}
