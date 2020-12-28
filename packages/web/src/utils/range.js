import {reverse} from "prange";
import {getRandomInt} from "./numbers";
import fileDownload from "js-file-download";

export const rangeStringFormatters = {
  gtoplus: {label: "GTO+", getWeightedRangeString: (rangeString, weight) => `[${weight}]${rangeString}[/${weight}]`}
}

export const combosToRangeString = (weightedCombos, format) => {
  const formatter = rangeStringFormatters[format].getWeightedRangeString;
  const weightCombosMap = weightedCombos.reduce((acc, [combo, weight]) => {
    return {
      ...acc,
      [weight]: (acc[weight] || []).concat([combo])
    }
  }, {});
  return Object
    .entries(weightCombosMap)
    .map(([weight, combos]) => parseInt(weight) === 100 ? reverse(combos) : formatter(reverse(combos), weight))
    .join(",");
}

export const actionComboStyler = (combos, actions) => combo => {
  let bgString;
  if (!combos[combo]) bgString = actions[0].color;
  else {
    bgString = "linear-gradient(to top";
    const total = combos[combo].reduce((a, b) => a + b, 0);
    const percentages = combos[combo].map((c) => (c / total) * 100);
    let sum = 0;
    actions.forEach((a, idx) => {
      const frequency = percentages[idx];
      sum += frequency;
      bgString += `, ${a.color} ${sum - frequency}%, ${
        a.color
      } ${sum}%`;
    });
    bgString += ")";
  }
  return {
    background: bgString,
  };
}

// use an RNG to select action according to frequencies
const getAction = (actions) => {
  const cumulativeFrequencies = actions.reduce(
    (a, x, i) => [...a, x + (a[i - 1] || 0)],
    []
  );
  const rng = getRandomInt(
    Math.min(...actions),
    cumulativeFrequencies[cumulativeFrequencies.length - 1]
  );
  const idx = cumulativeFrequencies.findIndex((f, i) => {
    return (
      rng <= f &&
      rng > (!cumulativeFrequencies[i - 1] ? 0 : cumulativeFrequencies[i - 1])
    );
  });
  return idx;
};

export const frequencyComboStyler = (combos, actions) => (combo) => {
  const processedCombos = Object.keys(combos).reduce((acc, current) => {
    return { ...acc, [current]: getAction(combos[current]) };
  }, {})
  return {
    backgroundColor: (
      actions.find((a, i) => {
        if (processedCombos[combo]) return i === processedCombos[combo];
        return false;
      }) || actions[0]
    ).color,
  }
};

export const downloadRange = (data) => {
  fileDownload(JSON.stringify(data), `${data.title.toLowerCase().replace(/\s+/g, "-")}.range`, "application/json");
};

export const defaultTags = [
  "UTG", "UTG+1", "UTG+2", "LJ", "HJ", "CO", "BTN", "SB", "BB",
  "vs UTG", "vs UTG+1", "vs UTG+2", "vs LJ", "vs HJ", "vs CO", "vs BTN", "vs SB", "vs BB",
  "micro", "low", "medium", "high",
  "100BB", "200BB", "75BB", "50BB", "30BB",
  "RFI", "vs limp", "vs open", "vs 3bet", "vs 4bet", "vs 5bet",
  "vs small bet", "vs medium bet", "vs big bet",
  "6max", "full ring", "heads up"
]
