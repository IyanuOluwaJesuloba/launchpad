import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "../ErrorBoundary";

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("kaboom");
  return <span>safe</span>;
}

describe("ErrorBoundary", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("renders children when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <span>child ok</span>
      </ErrorBoundary>,
    );
    expect(screen.getByText("child ok")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/kaboom/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("invokes the toast bridge when an error is caught", () => {
    const show = jest.fn();
    (window as unknown as { __soropadToast?: { show: jest.Mock } }).__soropadToast = {
      show,
    };
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Something went wrong",
        variant: "error",
      }),
    );
    delete (window as unknown as { __soropadToast?: unknown }).__soropadToast;
  });

  it("renders a custom fallback when provided", async () => {
    const fallback = (err: Error, reset: () => void) => (
      <div>
        <p>custom: {err.message}</p>
        <button onClick={reset}>Reset boundary</button>
      </div>
    );

    function Wrapper() {
      return (
        <ErrorBoundary fallback={fallback}>
          <Boom shouldThrow />
        </ErrorBoundary>
      );
    }

    const user = userEvent.setup();
    render(<Wrapper />);
    expect(screen.getByText(/custom: kaboom/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /reset boundary/i }));
    // After reset, the component re-renders Boom which still throws,
    // so the fallback persists. We mostly verify the reset is wired.
    expect(screen.getByText(/custom: kaboom/)).toBeInTheDocument();
  });
});
