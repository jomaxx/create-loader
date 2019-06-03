import * as React from "react";

const enum Status {
  Pending,
  Resolved,
  Rejected
}

type Record<Data> = {
  status: Status;
  value: Promise<void> | Data | Error;
};

export function createLoader<Deps, Data>(
  loader: (deps: Deps) => Promise<Data>,
  mapDeps: (deps: Deps) => readonly any[] = () => []
) {
  const Context = React.createContext<Record<Data>>({
    status: Status.Rejected,
    value: new Error("Missing LoadData component. Are you trying to 'useData' without an ancestor '<LoadData />'?")
  });

  function useData() {
    const context = React.useContext(Context);
    const [prevContext, setPrevContext] = React.useState(context);

    // forces react to render updates after suspending
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    if (prevContext !== context) {
      setPrevContext(context);
    }

    switch (context.status) {
      case Status.Pending:
        throw context.value;
      case Status.Resolved:
        return context.value as Data;
      case Status.Rejected:
        throw context.value;
      default:
        throw new Error("bad status");
    }
  }

  type Props = Deps & { children: React.ReactNode };

  function LoadData({ children, ...deps }: Props) {
    const _deps = (deps as unknown) as Deps;
    const value = React.useMemo(() => {
      const record: Record<Data> = {
        status: Status.Pending,
        value: loader(_deps).then(
          value => {
            record.status = Status.Resolved;
            record.value = value;
          },
          error => {
            record.status = Status.Rejected;
            record.value = error;
          }
        )
      };

      return record;
    }, mapDeps(_deps));

    return (
      <Context.Provider
        value={value} //
      >
        {children}
      </Context.Provider>
    );
  }

  return [LoadData, useData] as const;
}
