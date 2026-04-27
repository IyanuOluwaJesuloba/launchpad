import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast, type ToastVariant } from "../ToastProvider";

function Trigger({ variant = "info" }: { variant?: ToastVariant }) {
  const toast = useToast();
  return (
    <button
      onClick={() =>
        toast.show({
          title: "Hello",
          message: "World",
          variant,
          duration: 0,
        })
      }
    >
      Show toast
    </button>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    delete (window as unknown as { __soropadToast?: unknown }).__soropadToast;
  });

  it("renders queued toasts in the viewport", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger variant="success" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: /show toast/i }));

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
    // success uses role=status; error uses role=alert.
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for error variant", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger variant="error" />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: /show toast/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("dismisses a toast when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: /show toast/i }));
    expect(screen.getByText("Hello")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /dismiss notification/i }),
    );
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("installs a window bridge so non-React modules can push toasts", () => {
    render(
      <ToastProvider>
        <span>child</span>
      </ToastProvider>,
    );
    const bridge = (
      window as unknown as {
        __soropadToast?: {
          show: (t: { title: string; duration?: number }) => string;
        };
      }
    ).__soropadToast;
    expect(bridge).toBeDefined();
    act(() => {
      bridge!.show({ title: "From bridge", duration: 0 });
    });
    expect(screen.getByText("From bridge")).toBeInTheDocument();
  });
});
