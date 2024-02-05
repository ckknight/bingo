import * as React from "react";

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const stateTuple = React.useState(() => {
    const value = window.localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    if (typeof defaultValue === "function") {
      return (defaultValue as () => T)();
    } else {
      return defaultValue;
    }
  });
  const [state] = stateTuple;

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return stateTuple;
}

export function useLocalStorageReducer<S, A, I>(
  key: string,
  reducer: React.Reducer<S, A>,
  initializerArg: I,
  initializer: (loadedState: unknown, initializerArg: I) => S,
): [S, React.Dispatch<A>] {
  const [state, dispatch] = React.useReducer(
    reducer,
    initializerArg,
    (initialArg) => {
      let loadedState: unknown;
      try {
        const loaded = window.localStorage.getItem(key);
        if (loaded) {
          loadedState = JSON.parse(loaded);
        }
      } catch (error) {
        console.error("Error loading from localStorage", error);
      }
      return initializer(loadedState, initialArg);
    },
  );

  React.useEffect(() => {
    const serialized = JSON.stringify(state);
    try {
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }, [key, state]);

  return [state, dispatch];
}
