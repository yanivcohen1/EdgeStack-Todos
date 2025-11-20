"use client";

import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { InterWorkspaceSection } from "@/components/dashboard/InterWorkspaceSection";
import { useSession } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/http/token-storage";

export default function InterWorkspacePage() {
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

  return (
    <main>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        <Stack spacing={3}>
          <InterWorkspaceSection />
        </Stack>
      </Box>
    </main>
  );
}
