"use client";

import { FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { AdminPageLayout, useAdminSwitch } from "../page";

function InterWorkspaceTwoContent() {
  const { interWorkspaceEnabled, setInterWorkspaceEnabled } = useAdminSwitch();

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={700}>
            Inter2 workspace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track the second workspace stream and prototype shared tooling before promoting updates to the main admin flow.
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
    </Paper>
  );
}

export default function InterWorkspaceTwoPage() {
  return (
    <AdminPageLayout>
      <InterWorkspaceTwoContent />
    </AdminPageLayout>
  );
}
