import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseSession = vi.fn();
const mockUseTodos = vi.fn();
const mockGetAccessToken = vi.fn();
const mockApiGet = vi.fn();
const mockShowSnackbar = vi.fn();
const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

vi.mock("@/hooks/useAuth", () => ({
  useSession: () => mockUseSession()
}));

vi.mock("@/hooks/useTodos", () => ({
  useTodos: () => mockUseTodos()
}));

vi.mock("@/lib/http/token-storage", () => ({
  tokenStorage: {
    getAccessToken: () => mockGetAccessToken()
  }
}));

vi.mock("@/lib/http/client", () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args)
  }
}));

vi.mock("@/lib/ui/snackbar", () => ({
  showSnackbar: (...args: unknown[]) => mockShowSnackbar(...args)
}));

import MainPage from "./page";

describe("MainPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockReturnValue("token");
    mockUseSession.mockReturnValue({
      data: { user: { role: "admin", name: "Alice" } },
      isLoading: false,
      isError: false
    });
    mockUseTodos.mockReturnValue({
      data: { todos: [] },
      isLoading: false
    });
  });

  it("redirects to login when no session is available", async () => {
    mockGetAccessToken.mockReturnValue(undefined);
    mockUseSession.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });
});