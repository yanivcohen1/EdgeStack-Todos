"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Avatar, Box, Button, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { darken, useTheme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { ThemeToggle } from "@/components/common/ThemeToggle";
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
  { label: "Main", icon: <HomeRoundedIcon />, href: "/main" },
  { label: "Todo", icon: <ChecklistRoundedIcon />, href: "/todo" },
  {
    label: "Admin",
    icon: <ShieldRoundedIcon />,
    children: [
      { label: "Console", icon: <ShieldRoundedIcon />, href: "/admin" },
      { label: "Inter workspace", icon: <DescriptionRoundedIcon />, href: "/admin/nter" },
      { label: "Inter2 workspace", icon: <DescriptionRoundedIcon />, href: "/admin/nter2" }
    ]
  }
];

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Admin: false
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

  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user.role === "admin";
  const roleLabel = isAuthenticated ? (isAdmin ? "Admin" : "User") : undefined;
  const visibleNavItems = useMemo(() => navItems.filter((item) => item.label !== "Admin" || isAdmin), [isAdmin]);

  const handleNavigate = () => {
    onNavigate?.();
  };

  const handleLogin = () => {
    handleNavigate();
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      handleNavigate();
      router.push("/login");
    }
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeGroup = (label: string) => {
    setExpandedGroups((prev) => {
      if (!prev[label]) {
        return prev;
      }
      return { ...prev, [label]: false };
    });
  };

  const handleSimpleItemClick = (label: string) => {
    if (label !== "Admin") {
      closeGroup("Admin");
    }
    handleNavigate();
  };

  const isAnchorActive = (href?: string) => {
    if (!href) {
      return false;
    }

    if (!href.includes("#")) {
      return pathname === href || pathname.startsWith(`${href}/`);
    }

    const [pathPart, hashPart] = href.split("#");
    const pathMatches = pathPart ? pathname === pathPart : true;

    if (!hashPart) {
      return pathMatches;
    }

    if (typeof window === "undefined") {
      return hashPart === "main-section";
    }

    const currentHash = window.location.hash.replace(/^#/, "") || "main-section";
    return pathMatches && currentHash === hashPart;
  };

  useEffect(() => {
    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
    if (!isAdminPath) {
      setExpandedGroups((prev) => {
        if (!prev.Admin) {
          return prev;
        }
        return { ...prev, Admin: false };
      });
    }
  }, [pathname]);

  const selectedBgColor = theme.palette.mode === "light" ? darken(theme.palette.primary.main, 0.45) : theme.palette.primary.main;

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
        <ThemeToggle variant="inline" />
      </Stack>

      <List component="nav" disablePadding>
        {visibleNavItems.map((item) => {
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
                onClick={() => handleSimpleItemClick(item.label)}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1,
                  color: selected ? "primary.contrastText" : "text.primary",
                  bgcolor: selected ? selectedBgColor : "transparent",
                  transition: "background-color 150ms ease",
                  "& .MuiListItemIcon-root": {
                    color: selected ? "primary.contrastText" : "inherit"
                  },
                  "&:hover": {
                    bgcolor: selected ? selectedBgColor : "action.hover"
                  },
                  "&.Mui-selected": {
                    bgcolor: selectedBgColor
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: selectedBgColor
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            );
          }

          const isExpanded = expandedGroups[item.label] ?? false;

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
                          bgcolor: selected ? selectedBgColor : "transparent",
                          "& .MuiListItemIcon-root": {
                            color: selected ? "primary.contrastText" : "inherit"
                          },
                          "&:hover": {
                            bgcolor: selected ? selectedBgColor : "action.hover"
                          },
                          "&.Mui-selected": {
                            bgcolor: selectedBgColor
                          },
                          "&.Mui-selected:hover": {
                            bgcolor: selectedBgColor
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} primaryTypographyProps={{ fontWeight: 500 }} />
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
            <Typography fontWeight={600}>{session?.user.name ?? "Guest"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {session?.user.email ?? "Access limited"}
              {roleLabel ? ` • ${roleLabel}` : ""}
            </Typography>
          </Stack>
        </Stack>
        {isAuthenticated ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            disabled={isLoggingOut}
            fullWidth
            sx={{ mt: 3, borderRadius: 3, py: 1.5, fontWeight: 600 }}
          >
            Log out
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginRoundedIcon />}
            onClick={handleLogin}
            fullWidth
            sx={{ mt: 3, borderRadius: 3, py: 1.5, fontWeight: 600 }}
          >
            Log in
          </Button>
        )}
      </Box>
    </Stack>
  );
}
