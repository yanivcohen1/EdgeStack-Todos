"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { TodoStatusSummary } from "@/components/todos/TodoStatusSummary";
import { useSession } from "@/hooks/useAuth";
import { useTodos } from "@/hooks/useTodos";
import { tokenStorage } from "@/lib/http/token-storage";
import type { TodoFilterInput } from "@/lib/validation/todo";

export default function MainPage() {
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const unfilteredKey = useMemo<Partial<TodoFilterInput>>(() => ({}), []);
  const { data: summaryData, isLoading: summaryLoading } = useTodos(unfilteredKey);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const hasToken = !!tokenStorage.getAccessToken();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!hasToken || sessionError) && !sessionLoading) {
      router.push('/login');
    }
  }, [isMounted, hasToken, sessionError, sessionLoading, router]);

  if (!isMounted) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh">
        <CircularProgress />
      </Stack>
    );
  }

  if ((!hasToken || sessionError) && !sessionLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh">
        <CircularProgress />
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
      <Box sx={{ px: { xs: 2, md: 6 }, py: 1 }}>
        <TodoStatusSummary todos={summaryTodos} isLoading={isSummaryLoading} />
      </Box>
    </main>
  );
}
