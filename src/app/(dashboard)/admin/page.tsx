"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { Box, Button, CircularProgress, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { useSession } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/http/token-storage";

type AdminPageLayoutProps = {
  children?: ReactNode;
};

type AdminSwitchContextValue = {
  interWorkspaceEnabled: boolean;
  setInterWorkspaceEnabled: (enabled: boolean) => void;
};

const AdminSwitchContext = createContext<AdminSwitchContextValue | undefined>(undefined);

export function useAdminSwitch() {
  const context = useContext(AdminSwitchContext);
  if (!context) {
    throw new Error("useAdminSwitch must be used within AdminPageLayout");
  }
  return context;
}

export function AdminPageLayout({ children }: AdminPageLayoutProps) {
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const hasToken = !!tokenStorage.getAccessToken();
  const [interWorkspaceEnabled, setInterWorkspaceEnabled] = useState(false);

  if ((!hasToken || sessionError) && !sessionLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="70vh" spacing={2}>
        <Typography variant="h5">Please sign in to access the admin console.</Typography>
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
        <Typography variant="h5">You do not have access to the admin console.</Typography>
        <Button href="/todo" variant="contained">
          Go to todos
        </Button>
      </Stack>
    );
  }

  return (
    <AdminSwitchContext.Provider value={{ interWorkspaceEnabled, setInterWorkspaceEnabled }}>
      <main>
        <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack spacing={1}>
                <Typography variant="h3" fontWeight={700}>
                  Admin console
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage roles, enforce rate limits, and review access logs across the workspace.
                </Typography>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={interWorkspaceEnabled}
                    onChange={(_, checked) => setInterWorkspaceEnabled(checked)}
                  />
                }
                label={interWorkspaceEnabled ? "Inter2 workspace enabled" : "Inter2 workspace disabled"}
              />
            </Stack>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">Security overview</Typography>
                <Typography variant="body2" color="text.secondary">
                  This placeholder area is where you would surface guardrail metrics, API quotas, and access history. Hook
                  it up to MikroORM queries or telemetry as you grow the project.
                </Typography>
              </Stack>
            </Paper>

            {children}
          </Stack>
        </Box>
      </main>
    </AdminSwitchContext.Provider>
  );
}

export default function AdminPage() {
  return <AdminPageLayout />;
}
