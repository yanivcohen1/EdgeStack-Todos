"use client";

import { FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { AdminPageLayout, useAdminSwitch } from "../../../page";

const getQueryValue = (searchParams: ReturnType<typeof useSearchParams>, key: string) => {
  const value = searchParams.getAll(key);
  if (value.length === 0) {
    return "Not provided";
  }
  return value.join(", ");
};

function AdminUserContent({
  adminId,
  userId,
  queryId,
  queryName
}: {
  adminId: string;
  userId: string;
  queryId: string;
  queryName: string;
}) {
  const { interWorkspaceEnabled, setInterWorkspaceEnabled } = useAdminSwitch();

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Admin details
          </Typography>
          <Typography variant="body1">Admin id from path: {adminId}</Typography>
          <Typography variant="body2" color="text.secondary">
            The breadcrumb command navigates here via /admin/3/user/2?id=1&name=yar, so this section shows admin id:3 for that URL.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            User details
          </Typography>
          <Typography variant="body1">User id from path: {userId}</Typography>
          <Typography variant="body2" color="text.secondary">
            Query parameters
          </Typography>
          <Typography variant="body2">id: {queryId}</Typography>
          <Typography variant="body2">name: {queryName}</Typography>
          <FormControlLabel
            sx={{ mt: 1.5 }}
            control={
              <Switch
                color="primary"
                checked={interWorkspaceEnabled}
                onChange={(_, checked) => setInterWorkspaceEnabled(checked)}
              />
            }
            label={interWorkspaceEnabled ? "User workspace enabled" : "User workspace disabled"}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export default function AdminUserPage() {
  const params = useParams<{ adminId?: string; userId?: string }>();
  const searchParams = useSearchParams();
  const adminId = params?.adminId ?? "Unknown";
  const userId = params?.userId ?? "Unknown";
  const queryId = getQueryValue(searchParams, "id");
  const queryName = getQueryValue(searchParams, "name");

  return (
    <AdminPageLayout>
      <AdminUserContent adminId={adminId} userId={userId} queryId={queryId} queryName={queryName} />
    </AdminPageLayout>
  );
}
