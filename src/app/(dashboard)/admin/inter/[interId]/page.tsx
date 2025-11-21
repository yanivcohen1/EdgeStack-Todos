"use client";

import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { InterWorkspaceSection } from "@/components/dashboard/InterWorkspaceSection";
import { useSession } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/http/token-storage";

const formatValue = (value: string | null) => (value ? value : "Not provided");

export default function AdminInterPage() {
  const params = useParams<{ interId?: string }>();
  const searchParams = useSearchParams();
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const hasToken = !!tokenStorage.getAccessToken();

  if ((!hasToken || sessionError) && !sessionLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh" spacing={2}>
        <Typography variant="h5">Please sign in to see the Inter workspace.</Typography>
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

  if (session.user.role !== "admin") {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh" spacing={2}>
        <Typography variant="h5">You do not have access to this workspace.</Typography>
        <Button href="/todo" variant="contained">
          Go to todos
        </Button>
      </Stack>
    );
  }

  const interId = params?.interId ?? "Unknown";
  const queryId = formatValue(searchParams.get("id"));
  const queryName = formatValue(searchParams.get("name"));

  return (
    <main>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        <InterWorkspaceSection />
      </Box>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 1 }}>
        <Stack spacing={1}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700}>
                Inter workspace details
              </Typography>
              <Typography variant="body1">inter_id: {interId}</Typography>
              <Typography variant="body2">Query parameter id: {queryId}</Typography>
              <Typography variant="body2">Query parameter name: {queryName}</Typography>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </main>
  );
}
