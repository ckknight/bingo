import * as React from "react";
import { throwError } from "./throwError";

export type ReducersSpec<State> = {
  readonly [Key in string]: (state: State, ...args: never[]) => State;
};

export type Action<State, Reducers> = {
  readonly [Key in keyof Reducers]: {
    readonly type: Key;
    readonly payload: Reducers[Key] extends (
      state: State,
      ...args: infer Args
    ) => State
      ? Args
      : never;
  };
}[keyof Reducers];

export type DispatchersSpec<State, Reducers> = {
  readonly [Key in keyof Reducers]: (
    ...args: Reducers[Key] extends (state: State, ...args: infer Args) => State
      ? Args
      : never
  ) => void;
};

export function createReducerAndDispatchersFactory<
  State,
  Reducers extends ReducersSpec<State>,
>(reducersSpec: Reducers) {
  function reducer(state: State, action: Action<State, Reducers>) {
    const fn = reducersSpec[action.type];
    return fn ? fn(state, ...(action.payload as unknown[] as never[])) : state;
  }

  const names = Object.keys(reducersSpec);
  function createDispatchers(
    dispatch: React.Dispatch<Action<State, Reducers>>,
  ) {
    return Object.fromEntries(
      names.map((name) => [
        name,
        (...args: never[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dispatch({ type: name, payload: args as any });
        },
      ]),
    ) as unknown as DispatchersSpec<State, Reducers>;
  }

  return {
    reducer,
    createDispatchers,
  };
}

export function createReducerHelpers<State>(config: {
  initializer: () => State;
  syncState?: (state: State) => void;
}) {
  const { initializer, syncState } = config;
  return <Reducers extends ReducersSpec<State>>(reducersSpec: Reducers) => {
    function reducer(state: State, action: Action<State, Reducers>) {
      const fn = reducersSpec[action.type];
      return fn
        ? fn(state, ...(action.payload as unknown[] as never[]))
        : state;
    }

    const names = Object.keys(reducersSpec);
    function createDispatchers(
      dispatch: React.Dispatch<Action<State, Reducers>>,
    ) {
      return Object.fromEntries(
        names.map((name) => [
          name,
          (...args: never[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch({ type: name, payload: args as any });
          },
        ]),
      ) as unknown as DispatchersSpec<State, Reducers>;
    }

    const StateContext = React.createContext<State | undefined>(undefined);
    const DispatchContext = React.createContext<
      DispatchersSpec<State, Reducers> | undefined
    >(undefined);

    function useState() {
      return (
        React.useContext(StateContext) ??
        throwError("useState must be used within a Provider")
      );
    }

    function useDispatch() {
      return (
        React.useContext(DispatchContext) ??
        throwError("useDispatch must be used within a Provider")
      );
    }

    const useSyncState = syncState
      ? (state: State) => {
          React.useEffect(() => {
            syncState(state);
          }, [state]);
        }
      : () => {};

    return {
      reducer,
      createDispatchers,
      useState,
      useDispatch,
      Provider({ children }: { children: React.ReactNode }) {
        const [state, dispatch] = React.useReducer(
          reducer,
          undefined,
          initializer,
        );
        useSyncState(state);
        return (
          <DispatchContext.Provider
            value={React.useMemo(() => createDispatchers(dispatch), [])}
          >
            <StateContext.Provider value={state}>
              {children}
            </StateContext.Provider>
          </DispatchContext.Provider>
        );
      },
    };
  };
}
