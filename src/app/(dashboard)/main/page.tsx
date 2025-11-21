"use client";

import { useMemo, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { TodoStatusSummary } from "@/components/todos/TodoStatusSummary";
import { useSession } from "@/hooks/useAuth";
import { useTodos } from "@/hooks/useTodos";
import { tokenStorage } from "@/lib/http/token-storage";
import { api } from "@/lib/http/client";
import { showSnackbar } from "@/lib/ui/snackbar";
import type { TodoFilterInput } from "@/lib/validation/todo";
import type { SessionUser } from "@/types/auth";

export default function MainPage() {
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const unfilteredKey = useMemo<Partial<TodoFilterInput>>(() => ({}), []);
  const { data: summaryData, isLoading: summaryLoading } = useTodos(unfilteredKey);
  const [isProfileCheckPending, setIsProfileCheckPending] = useState(false);

  const hasToken = !!tokenStorage.getAccessToken();

  const handleShowUserDetails = async () => {
    try {
      setIsProfileCheckPending(true);
      const { data } = await api.get<{ info: SessionUser }>("/api/auth/info", {
        // params: { scope: "admin-inspect" }
      });
      const roleLabel = data.info.role === "admin" ? "Admin" : "User";
      showSnackbar({ message: `${data.info.name} • ${roleLabel}`, severity: "info" });
    } catch (error) {
      let message = "Unknown server error";
      if (isAxiosError(error)) {
        const details = JSON.stringify(error.response?.data ?? error.message, null, 2);
        message = details === error.message ? error.message : `${error.message} • ${details}`;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      console.error("Failed to fetch user details", error);
      console.error("error msg", message);
      // showSnackbar({ message, severity: "error" });
    } finally {
      setIsProfileCheckPending(false);
    }
  };

  if ((!hasToken || sessionError) && !sessionLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh" spacing={2}>
        <Typography variant="h5">Please sign in to review the main status board.</Typography>
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

  const summaryTodos = summaryData?.todos;
  const isSummaryLoading = summaryLoading && !summaryTodos?.length;

  return (
    <main>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          mb={4}
        >
          <Stack spacing={1}>
            <Typography variant="h2" fontWeight={700}>
              Main status board
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay ahead of your workload with counts per status and due date.
            </Typography>
          </Stack>
            <Button variant="outlined" onClick={handleShowUserDetails} disabled={isProfileCheckPending}>
              {isProfileCheckPending ? "Loading..." : "Show user info"}
            </Button>
        </Stack>
        <TodoStatusSummary todos={summaryTodos} isLoading={isSummaryLoading} />
      </Box>
    </main>
  );
}
