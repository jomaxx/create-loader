import * as React from "react";
import { render, cleanup } from "@testing-library/react";
import { createLoader } from "./createLoader";

afterEach(cleanup);

test("loads", async () => {
  const value = "test";
  const { findByText } = render(<Test value={value} />);
  await findByText(value);
});

test("updates", async () => {
  const initial = "initial";
  const value = "test";
  const { findByText, rerender } = render(<Test value={initial} />);
  await findByText(initial);
  rerender(<Test value={value} />);
  await findByText(value);
});

test("throws error", async () => {
  const error = new Error("error");
  const { findByText } = render(<Test value={Promise.reject(error)} />);
  await findByText(error.message);
});

const [LoadValue, useValue] = createLoader(
  ({ value }: { value: any }) => Promise.resolve(value),
  ({ value }) => [value]
);

// prevent rerenders from prop changes to properly test updates
const Value = React.memo(function Value() {
  const value = useValue();
  return <h1>{value}</h1>;
});

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { error };
  }

  state = {
    error: undefined
  };

  render() {
    if (this.state.error) {
      return <h1>{this.state.error.message}</h1>;
    }

    return this.props.children;
  }
}

function Test({ value }) {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <LoadValue value={value}>
          <Value />
        </LoadValue>
      </React.Suspense>
    </ErrorBoundary>
  );
}
