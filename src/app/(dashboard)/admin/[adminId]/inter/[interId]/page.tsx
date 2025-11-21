"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { InterWorkspaceSection } from "@/components/dashboard/InterWorkspaceSection";
import { AdminPageLayout } from "../../../page";

const formatQueryValue = (value: string | null) => (value ? value : "Not provided");

export default function AdminInterWorkspacePage() {
  const params = useParams<{ adminId?: string; interId?: string }>();
  const searchParams = useSearchParams();

  const adminId = params?.adminId ?? "Unknown";
  const interId = params?.interId ?? "Unknown";
  const queryId = formatQueryValue(searchParams.get("id"));
  const queryName = formatQueryValue(searchParams.get("name"));

  return (
    <AdminPageLayout>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Inter workspace metadata
            </Typography>
            <Typography variant="body1">Admin id from path: {adminId}</Typography>
            <Typography variant="body1">inter_id: {interId}</Typography>
            <Typography variant="body2">Query parameter id: {queryId}</Typography>
            <Typography variant="body2">Query parameter name: {queryName}</Typography>
          </Stack>
        </Paper>

        <InterWorkspaceSection />
      </Stack>
    </AdminPageLayout>
  );
}
