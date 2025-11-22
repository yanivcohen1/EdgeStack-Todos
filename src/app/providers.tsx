"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CssBaseline, ThemeProvider, PaletteMode, useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";
import { createAppTheme } from "@/theme";
import { SnackbarProvider } from "@/components/common/SnackbarProvider";
import { ThemeModeContext } from "@/hooks/useThemeMode";
import { loadingBarController } from "@/lib/ui/loading-bar";

export function RootProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000
          }
        }
      })
  );

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    defaultMatches: true
  });
  const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? "dark" : "light");

  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, [prefersDarkMode]);

  const loadingBarRef = useRef<LoadingBarRef | null>(null);

  useEffect(() => {
    const currentRef = loadingBarRef.current;
    if (!currentRef) {
      return;
    }
    loadingBarController.register(currentRef);
    return () => {
      loadingBarController.unregister(currentRef);
    };
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme-mode", newMode);
      return newMode;
    });
  };

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeContext.Provider value={{ mode, toggleMode }}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
              <SnackbarProvider>
                <LoadingBar ref={loadingBarRef} color={theme.palette.primary.main} height={3} shadow={true} transitionTime={200} />
                {children}
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
              </SnackbarProvider>
            </QueryClientProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
