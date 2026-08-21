import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Authentication from "./Authentication";

vi.mock("../auth/authService", () => ({
  getStoredAuth: () => ({ token: null, user: null }),
  fetchMe: vi.fn(),
  clearAuth: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../api/client", () => ({
  setOnUnauthorized: vi.fn(),
}));

describe("Authentication", () => {
  it("renders login page for unauthenticated users", async () => {
    render(<Authentication />);
    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  });
});
