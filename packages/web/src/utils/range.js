import {getRandomInt} from "./numbers";
import fileDownload from "js-file-download";
import Ajv from "ajv";
import schema from "../data/range.schema.json";
import { shortenPairs, shortenNonPairs } from "./shorten";

const ajv = new Ajv({strict: false});
ajv.addSchema(schema);
export const validateActions = ajv.getSchema("actions");
export const validateCombos = ajv.getSchema("combos");
export const validate = ajv.compile(schema);

export const rangeStringFormatters = {
  gtoplus: {label: "GTO+", getWeightedRangeString: (rangeString, weight) => weight === 100 ? rangeString : `[${weight.toFixed(1)}]${rangeString}[/${weight.toFixed(1)}]`},
  pio: {label: "PioSolver", getWeightedRangeString: (rangeString, weight) => rangeString.split(",").map(i => `${i}:${(weight/100).toFixed(2)}`).join(",")}
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
    .map(([weight, combos]) => formatter(shortenRange(combos), parseFloat(weight)))
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
  "RFI", "Open", "vs limp", "vs open", "vs 3bet", "vs 4bet", "vs 5bet",
  "vs small bet", "vs medium bet", "vs big bet",
  "6max", "full ring", "heads up",
  "GTO", "exploitative", "vs nit", "vs TAG", "vs LAG", "vs fish", "vs whale",
]

const sortOut = (combos) => {
  const offsuit = new Set();
  const suited = new Set();
  const pairs = new Set();
  combos.forEach(([rank1, rank2, suit]) => {
    const combo = rank1 + rank2;
    if (rank1 === rank2) pairs.add(combo)
    else if (!suit || suit === "o") offsuit.add(combo)
    else if (suit === "s") suited.add(combo)
    else throw new Error(`Invalid suit ${suit} of ${combo}!`)
  });

  return { offsuit, suited, pairs }
}

const unsuitNonPairs = (os, su) => {
  const osArray = Array.from(os);
  const suArray = Array.from(su);
  const intersection = new Set();
  for(const combo of osArray) if(su.has(combo.replace(/o/g, 's'))) intersection.add(combo.replace(/o/g, ''));

  const intersectionFilter = suffix => i => !intersection.has(i.replace(new RegExp(suffix,"g"), ''));

  return Array.from(intersection)
    .concat(
      osArray.filter(intersectionFilter("o")),
      suArray.filter(intersectionFilter("s")),
    );
}

export const shortenRange = (combos) => {
  const { offsuit, suited, pairs } = sortOut(combos);
  const ps = shortenPairs(pairs);
  const os = shortenNonPairs(offsuit, 'o');
  const su = shortenNonPairs(suited, 's');
  const nonpairs = unsuitNonPairs(new Set(os), new Set(su));

  return ps.concat(nonpairs).join(', ');
}
