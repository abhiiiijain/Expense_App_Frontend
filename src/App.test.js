import { render, screen } from "@testing-library/react";
import Authentication from "./Authentication";

jest.mock("./auth/authService", () => ({
  getStoredAuth: () => ({ token: null, user: null }),
  fetchMe: jest.fn(),
  setOnUnauthorized: jest.fn(),
  apiClient: { interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } },
}));

test("renders login page for unauthenticated users", async () => {
  render(<Authentication />);
  expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
});
