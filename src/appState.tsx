import { SIZE_OPTIONS, SizeOption } from "./sizes";
import { createReducerHelpers } from "./reducerHelpers";
import { shufflePhrases } from "./shufflePhrases";

interface AppState {
  title: string;
  phrases: string[];
  printCount: number;
  size: SizeOption;
  css: {
    ar?: number;
    cbg?: string;
    cfg?: string;
    gap?: number;
    gbg?: string;
    font?: string;
  };
}

const LOCAL_STORAGE_KEY = "bingo";

export const {
  Provider: AppStateProvider,
  useState: useAppState,
  useDispatch: useAppDispatch,
} = createReducerHelpers<AppState>({
  initializer() {
    try {
      const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItem) {
        const state = JSON.parse(storedItem);
        let { title, printCount, size, phrases, css } = state;
        if (typeof title !== "string" || title === "") {
          title = "Your Bingo Card";
        }
        if (typeof printCount !== "number" || printCount < 1) {
          printCount = 1;
        }
        if (!SIZE_OPTIONS.includes(size)) {
          size = "5x5";
        }
        if (!Array.isArray(phrases)) {
          phrases = [];
        }
        if (
          Object(css) !== css ||
          Object.getPrototypeOf(css) !== Object.prototype
        ) {
          css = {};
        }
        return { title, printCount, size, phrases, css };
      }
    } catch {
      // do nothing
    }
    return {
      title: "Your Bingo Card",
      printCount: 1,
      size: "5x5",
      phrases: [],
      css: {},
    };
  },
  syncState(state): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // do nothing
    }
  },
})({
  setTitle(state, title: string) {
    return { ...state, title };
  },
  setPrintCount(state, printCount: number) {
    return { ...state, printCount };
  },
  setSize(state, size: AppState["size"]) {
    return { ...state, size };
  },
  setPhrase(state, index: number, value: string) {
    const phrases = [...state.phrases];
    phrases[index] = value;
    return { ...state, phrases };
  },
  shuffle(state) {
    return {
      ...state,
      phrases: shufflePhrases(state.phrases, state.size),
    };
  },
  setCSSVariable<N extends keyof AppState["css"]>(
    state: AppState,
    name: N,
    value: AppState["css"][N],
  ): AppState {
    return { ...state, css: { ...state.css, [name]: value } };
  },
});
