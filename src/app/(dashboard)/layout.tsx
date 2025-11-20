"use client";

import { ReactNode, useState } from "react";
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      {isDesktop ? (
        <Box
          component="aside"
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 3,
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            minHeight: "100vh"
          }}
        >
          <DashboardSidebar />
        </Box>
      ) : (
        <>
          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: 260, px: 2, py: 3 } }}
            sx={{ zIndex: theme.zIndex.modal + 1 }}
          >
            <DashboardSidebar onNavigate={() => setIsDrawerOpen(false)} />
          </Drawer>

          <IconButton
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            sx={{
              position: "fixed",
              bottom: 24,
              left: 24,
              zIndex: theme.zIndex.modal + 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 6,
              "&:hover": { bgcolor: "primary.dark" }
            }}
            aria-label={isDrawerOpen ? "Close navigation" : "Open navigation"}
          >
            {isDrawerOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
          </IconButton>
        </>
      )}

      <Box component="main" sx={{ flex: 1, minHeight: "100vh", width: "100%" }}>
        {children}
      </Box>
    </Box>
  );
}
