import React from "react";
import "./HandMatrix.css";

export const combos = [
  "AA",
  "AKs",
  "AQs",
  "AJs",
  "ATs",
  "A9s",
  "A8s",
  "A7s",
  "A6s",
  "A5s",
  "A4s",
  "A3s",
  "A2s",
  "AKo",
  "KK",
  "KQs",
  "KJs",
  "KTs",
  "K9s",
  "K8s",
  "K7s",
  "K6s",
  "K5s",
  "K4s",
  "K3s",
  "K2s",
  "AQo",
  "KQo",
  "QQ",
  "QJs",
  "QTs",
  "Q9s",
  "Q8s",
  "Q7s",
  "Q6s",
  "Q5s",
  "Q4s",
  "Q3s",
  "Q2s",
  "AJo",
  "KJo",
  "QJo",
  "JJ",
  "JTs",
  "J9s",
  "J8s",
  "J7s",
  "J6s",
  "J5s",
  "J4s",
  "J3s",
  "J2s",
  "ATo",
  "KTo",
  "QTo",
  "JTo",
  "TT",
  "T9s",
  "T8s",
  "T7s",
  "T6s",
  "T5s",
  "T4s",
  "T3s",
  "T2s",
  "A9o",
  "K9o",
  "Q9o",
  "J9o",
  "T9o",
  "99",
  "98s",
  "97s",
  "96s",
  "95s",
  "94s",
  "93s",
  "92s",
  "A8o",
  "K8o",
  "Q8o",
  "J8o",
  "T8o",
  "98o",
  "88",
  "87s",
  "86s",
  "85s",
  "84s",
  "83s",
  "82s",
  "A7o",
  "K7o",
  "Q7o",
  "J7o",
  "T7o",
  "97o",
  "87o",
  "77",
  "76s",
  "75s",
  "74s",
  "73s",
  "72s",
  "A6o",
  "K6o",
  "Q6o",
  "J6o",
  "T6o",
  "96o",
  "86o",
  "76o",
  "66",
  "65s",
  "64s",
  "63s",
  "62s",
  "A5o",
  "K5o",
  "Q5o",
  "J5o",
  "T5o",
  "95o",
  "85o",
  "75o",
  "65o",
  "55",
  "54s",
  "53s",
  "52s",
  "A4o",
  "K4o",
  "Q4o",
  "J4o",
  "T4o",
  "94o",
  "84o",
  "74o",
  "64o",
  "54o",
  "44",
  "43s",
  "42s",
  "A3o",
  "K3o",
  "Q3o",
  "J3o",
  "T3o",
  "93o",
  "83o",
  "73o",
  "63o",
  "53o",
  "43o",
  "33",
  "32s",
  "A2o",
  "K2o",
  "Q2o",
  "J2o",
  "T2o",
  "92o",
  "82o",
  "72o",
  "62o",
  "52o",
  "42o",
  "32o",
  "22",
];

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const defaultRender = (combo, styles, comboSubtext, showText, colorize) => (
  <div
    className={colorize ? getComboClassName(combo) : null}
    style={{
      display: "flex",
      flexDirection: "column",
      ...styles,
    }}
  >
    {showText && (
      <>
        <div style={{ flexGrow: 1 }} type="keyboard">
          {combo}
        </div>
        <div>{comboSubtext}</div>
      </>
    )}
  </div>
);

const ComboTile = React.memo(
  ({
    combo,
    styles = {},
    comboSubtext = "",
    showText = true,
    colorize = true,
    renderItem = defaultRender,
  }) => {
    return renderItem(combo, styles, comboSubtext, showText, colorize);
  }
);

const ComboRow = React.memo(
  ({
    row,
    onSelect,
    comboStyle,
    renderItem,
    comboSubtext,
    showText,
    colorize,
  }) => (
    <div className="hand-matrix-row">
      {row.map((combo, j) => (
        <div
          className="hand-matrix-cell"
          style={{ width: `${(1 / 13) * 100}%` }}
          onClick={() => onSelect && onSelect(combo)}
          key={j}
        >
          <ComboTile
            combo={combo}
            showText={showText}
            comboSubtext={comboSubtext ? comboSubtext(combo) : ""}
            styles={comboStyle ? comboStyle(combo) : {}}
            colorize={colorize}
            renderItem={renderItem}
          />
        </div>
      ))}
    </div>
  )
);

function HandMatrix({
  comboSubtext,
  renderItem,
  comboStyle,
  onSelect,
  showText = true,
  colorize = true,
}) {
  return (
    <div className={`hand-matrix ${onSelect ? "selectable" : "unselectable"}`}>
      {chunk(combos, 13).map((row, i) => (
        <ComboRow
          key={i}
          showText={showText}
          comboSubtext={comboSubtext}
          comboStyle={comboStyle}
          row={row}
          onSelect={onSelect}
          colorize={colorize}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}

function getComboClassName(combo) {
  if (combo.length === 2) {
    return "pair";
  } else if (combo.endsWith("s")) {
    return "suited";
  } else {
    return "offsuit";
  }
}

export default HandMatrix;
