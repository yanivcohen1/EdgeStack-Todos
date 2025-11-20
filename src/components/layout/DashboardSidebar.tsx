"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { useLogout, useSession } from "@/hooks/useAuth";

export type DashboardSidebarProps = {
  onNavigate?: () => void;
};

type NavItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { label: "Main", icon: <HomeRoundedIcon />, href: "#main-section" },
  { label: "Todo", icon: <ChecklistRoundedIcon />, href: "#todo-section" },
  {
    label: "User",
    icon: <PersonRoundedIcon />,
    children: [
      { label: "Inter", icon: <DescriptionRoundedIcon />, href: "#inter-section" },
      { label: "Admin", icon: <ShieldRoundedIcon />, href: "#admin-section" }
    ]
  }
];

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    User: true
  });

  const initials = useMemo(() => {
    const name = session?.user.name ?? "";
    if (!name) return "?";
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [session?.user.name]);

  const handleNavigate = () => {
    onNavigate?.();
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isAnchorActive = (href?: string) => {
    if (!href) {
      return false;
    }
    if (href.startsWith("#")) {
      if (typeof window === "undefined") {
        return href === "#main-section";
      }
      const currentHash = window.location.hash || "#main-section";
      return currentHash === href;
    }
    return pathname === href;
  };

  return (
    <Stack spacing={3} sx={{ minHeight: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={1}>
        <Stack spacing={0.5}>
          <Typography fontWeight={700} fontSize={20}>
            FocusFlow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stay on track
          </Typography>
        </Stack>
        <IconButton size="small" color="inherit" aria-label="open settings">
          <SettingsRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <List component="nav" disablePadding>
        {navItems.map((item) => {
          const hasChildren = !!item.children?.length;
          if (!hasChildren) {
            const selected = isAnchorActive(item.href);
            const buttonProps = item.href
              ? {
                  component: Link,
                  href: item.href,
                  scroll: true
                }
              : {};

            return (
              <ListItemButton
                key={item.label}
                {...buttonProps}
                onClick={handleNavigate}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1,
                  color: selected ? "primary.contrastText" : "text.primary",
                  bgcolor: selected ? "primary.main" : "transparent",
                  transition: "background-color 150ms ease"
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            );
          }

          const isExpanded = expandedGroups[item.label] ?? true;

          return (
            <Box key={item.label}>
              <ListItemButton onClick={() => toggleGroup(item.label)} sx={{ borderRadius: 2, mb: 1, px: 2, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                <ExpandMoreRoundedIcon
                  sx={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 150ms ease"
                  }}
                />
              </ListItemButton>
              <Collapse in={isExpanded} unmountOnExit>
                <List component="div" disablePadding>
                  {item.children?.map((child) => {
                    const selected = isAnchorActive(child.href);
                    const childButtonProps = child.href
                      ? {
                          component: Link,
                          href: child.href,
                          scroll: true
                        }
                      : {};

                    return (
                      <ListItemButton
                        key={child.label}
                        {...childButtonProps}
                        onClick={handleNavigate}
                        selected={selected}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          ml: 4,
                          px: 2,
                          py: 1,
                          color: selected ? "primary.contrastText" : "text.secondary",
                          bgcolor: selected ? "primary.main" : "action.hover"
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} primaryTypographyProps={{ fontWeight: 500 }} />
                        <KeyboardArrowRightRoundedIcon fontSize="small" />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box mt="auto">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>{initials}</Avatar>
          <Stack>
            <Typography fontWeight={600}>{session?.user.name ?? "Anonymous"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {session?.user.email ?? "Pending invite"}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutRoundedIcon />}
          onClick={async () => {
            await logout();
            handleNavigate();
          }}
          disabled={isLoggingOut}
          fullWidth
          sx={{ mt: 3, borderRadius: 3, py: 1.5, fontWeight: 600 }}
        >
          Log out
        </Button>
      </Box>
    </Stack>
  );
}
