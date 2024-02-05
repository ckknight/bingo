import * as React from "react";
import "./App.css";
import { AppStateProvider, useAppDispatch, useAppState } from "./appState";
import { SIZE_OPTIONS, SizeOption, parseSizeOption } from "./sizes";
import classNames from "classnames";
import { useEventHandler } from "./useEventHandler";
import { shufflePhrases } from "./shufflePhrases";
import { useFontFamilies } from "./useFontOptions";
import { parseFont } from "./parseFont";

export default function App() {
  return (
    <AppStateProvider>
      <CSSVariablesProvider>
        <BingoCard />
        <BingoControls />
        <PrintOnlyBingoCards />
      </CSSVariablesProvider>
    </AppStateProvider>
  );
}

function CSSVariablesProvider({ children }: { children?: React.ReactNode }) {
  const { css, size } = useAppState();
  const { columns } = parseSizeOption(size);
  return (
    <div
      style={React.useMemo(
        () =>
          ({
            "--column-count": columns,
            ...Object.fromEntries(
              Object.entries(css).map(([name, value]) => [`--${name}`, value]),
            ),
          }) as React.CSSProperties,
        [columns, css],
      )}
      className="css-variables-provider"
    >
      {children}
    </div>
  );
}

function PrintOnlyBingoCards() {
  const { printCount } = useAppState();

  return (
    <div className="print-only">
      <div className="print-break" />
      {Array.from({ length: printCount - 1 }, (_, index) => (
        <React.Fragment key={index}>
          <BingoCard shuffled />
          <div className="print-break" />
        </React.Fragment>
      ))}
    </div>
  );
}

const BingoTable = React.memo(function BingoTable({
  shuffled = false,
}: {
  shuffled?: boolean;
}) {
  const { phrases, size } = useAppState();
  const { setPhrase } = useAppDispatch();

  const shuffledPhrases = React.useMemo(
    () => (shuffled ? shufflePhrases(phrases, size) : phrases),
    [phrases, size, shuffled],
  );

  const { total } = parseSizeOption(size);

  return (
    <div className="grid">
      {Array.from({ length: total }, (_, index) => (
        <div key={index} className="cell">
          <EditableText
            text={shuffledPhrases[index] ?? ""}
            onChangeText={(value) => setPhrase(index, value)}
            className="cell-input"
            multiline
          />
        </div>
      ))}
    </div>
  );
});

const BingoControls = React.memo(function BingoControls() {
  const { css, printCount, size } = useAppState();
  const { shuffle, setCSSVariable, setPrintCount, setSize } = useAppDispatch();
  useEventHandler(window, "beforeprint", shuffle);

  return (
    <div className="controls">
      <div>
        <label>
          Size:{" "}
          <select
            value={size}
            onChange={(event) => {
              setSize(event.currentTarget.value as SizeOption);
            }}
          >
            {SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <FontInput />
      </div>
      <div>
        <label>
          Background:{" "}
          <input
            type="color"
            value={css.cbg ?? "#ffffff"}
            onChange={(event) =>
              setCSSVariable("cbg", event.currentTarget.value)
            }
          />
        </label>{" "}
        <label>
          Foreground:{" "}
          <input
            type="color"
            value={css.cfg ?? "#000000"}
            onChange={(event) =>
              setCSSVariable("cfg", event.currentTarget.value)
            }
          />
        </label>
      </div>
      <div>
        <label>
          Aspect Ratio:{" "}
          <input
            type="number"
            min={0.5}
            max={2}
            step={0.01}
            value={css.ar ?? 1}
            onChange={(event) => {
              setCSSVariable("ar", event.currentTarget.valueAsNumber);
            }}
          />
        </label>
      </div>
      <div>
        <label>
          Gap:{" "}
          <input
            type="number"
            min={0}
            max={20}
            step={1}
            value={css.gap ?? 1}
            onChange={(event) => {
              setCSSVariable("gap", event.currentTarget.valueAsNumber);
            }}
          />
          px
        </label>{" "}
        <label>
          Color:{" "}
          <input
            type="color"
            value={css.gbg ?? "#000000"}
            onChange={(event) => {
              setCSSVariable("gbg", event.currentTarget.value);
            }}
          />
        </label>
      </div>
      <div>
        <label>
          Print count:{" "}
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={printCount}
            onChange={(event) => {
              setPrintCount(event.currentTarget.valueAsNumber);
            }}
          />
        </label>
      </div>
      <button type="button" onClick={shuffle}>
        Shuffle
      </button>
      <button type="button" onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
});

const FontInput = React.memo(function FontInput() {
  const fontFamilies = useFontFamilies();

  const { css } = useAppState();
  const { setCSSVariable } = useAppDispatch();
  const { font = "" } = css;
  const { fontSizePt, lineHeight, fontFamily } = parseFont(font);
  const buildFont = React.useCallback(
    ({
      fontSizePt: fs = fontSizePt,
      lineHeight: lh = lineHeight,
      fontFamily: ff = fontFamily,
    }: {
      fontSizePt?: number;
      lineHeight?: number;
      fontFamily?: string;
    }) => `${fs}pt/${lh} "${ff}"`,
    [fontFamily, fontSizePt, lineHeight],
  );

  const setFont = React.useCallback(
    (options: {
      fontSizePt?: number;
      lineHeight?: number;
      fontFamily?: string;
    }) => {
      setCSSVariable("font", buildFont(options));
    },
    [buildFont, setCSSVariable],
  );

  return (
    <label>
      Font:{" "}
      <input
        type="number"
        value={fontSizePt}
        min={6}
        max={48}
        step={1}
        onChange={(event) => {
          setFont({ fontSizePt: event.currentTarget.valueAsNumber });
        }}
      />
      pt/
      <input
        type="number"
        value={lineHeight}
        min={0}
        max={2}
        step={0.05}
        onChange={(event) => {
          setFont({ lineHeight: event.currentTarget.valueAsNumber });
        }}
      />{" "}
      <select
        value={fontFamily}
        onChange={(event) => {
          setFont({ fontFamily: event.currentTarget.value });
        }}
      >
        {fontFamilies.map((option) => (
          <option
            key={option}
            value={option}
            style={{ font: buildFont({ fontFamily: option }) }}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
});

function BingoCard({ shuffled }: { shuffled?: boolean }) {
  const {
    title,
    css: { font },
  } = useAppState();
  const { fontFamily } = parseFont(font ?? "");

  const { setTitle } = useAppDispatch();
  return (
    <form>
      <div>
        <h2>
          <EditableText
            id="bingo-card-name"
            text={title}
            onChangeText={setTitle}
            style={{
              fontSize: "3rem",
              fontFamily,
              width: "100%",
            }}
          />
        </h2>
        <BingoTable shuffled={shuffled} />
      </div>
    </form>
  );
}

function EditableText({
  text,
  onChangeText,
  id,
  className,
  style,
  multiline = false,
}: {
  text: string;
  onChangeText: (value: string) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  const onChange = React.useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  >(
    (event) => {
      onChangeText(event.target.value);
    },
    [onChangeText],
  );
  if (multiline) {
    return (
      <textarea
        id={id}
        onChange={onChange}
        className={classNames("editable-text", className)}
        style={style}
      >
        {text}
      </textarea>
    );
  } else {
    return (
      <input
        type="text"
        id={id}
        value={text}
        onChange={onChange}
        autoFocus
        className={classNames("editable-text", className)}
        style={style}
      />
    );
  }
}
