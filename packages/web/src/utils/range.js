import {reverse} from "prange";
import {getRandomInt} from "./numbers";
import fileDownload from "js-file-download";
import Ajv from "ajv";
import schema from "../data/range.schema.json";

const ajv = new Ajv({strict: false});
ajv.addSchema(schema);
export const validateActions = ajv.getSchema("actions");
export const validateCombos = ajv.getSchema("combos");
export const validate = ajv.compile(schema);

export const rangeStringFormatters = {
  gtoplus: {label: "GTO+", getWeightedRangeString: (rangeString, weight) => `[${weight.toFixed(1)}]${rangeString}[/${weight.toFixed(1)}]`}
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
    .map(([weight, combos]) => parseInt(weight) === 100 ? reverse(combos) : formatter(reverse(combos), parseFloat(weight)))
    .join(",")
    .replaceAll(" ", "");
}

export const actionComboStyler = (combos, actions) => combo => {
  let bgString;
  if (!combos[combo]) bgString = actions[0].color;
  else {
    bgString = "linear-gradient(to left";
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

export const frequencyComboStyler = (combos, actions) => {
  const processedCombos = Object.keys(combos).reduce((acc, current) => {
    return { ...acc, [current]: getAction(combos[current]) };
  }, {})

  return (combo) => ({
    backgroundColor: (
      actions.find((a, i) => {
        if (processedCombos[combo]) return i === processedCombos[combo];
        return false;
      }) || actions[0]
    ).color,
  })
};

export const downloadRange = (data) => {
  delete data._rev;
  fileDownload(JSON.stringify(data), `${data.title.toLowerCase().replace(/\s+/g, "-")}.range`, "application/json");
};

export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = res => {
      resolve(res.target.result);
    };
    reader.onerror = err => reject(err);
    reader.readAsText(file);
  });
}

export const defaultTags = [
  "EP", "MP", "UTG", "UTG+1", "UTG+2", "LJ", "HJ", "CO", "BTN", "SB", "BB",
  "vs EP", "vs MP", "vs UTG", "vs UTG+1", "vs UTG+2", "vs LJ", "vs HJ", "vs CO", "vs BTN", "vs SB", "vs BB",
  "micro", "low stakes", "medium stakes", "high stakes",
  "100BB", "200BB", "75BB", "50BB", "30BB",
  "RFI", "vs limp", "vs open", "vs 3bet", "vs 4bet", "vs 5bet",
  "vs small bet", "vs medium bet", "vs big bet",
  "6max", "full ring", "heads up",
  "GTO", "exploitative", "vs nit", "vs TAG", "vs LAG", "vs fish", "vs whale",
]
