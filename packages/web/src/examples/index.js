const examples = [
  {
    value: "simple",
    label: "Simple (20BB BTN Push/Fold)",
    data: require(`./simple.json`),
  },
  {
    value: "multi",
    label: "Multiple Actions (UTG RFI 30BB)",
    data: require(`./multiple.json`),
  },
  {
    value: "advanced",
    label: "Advanced (BTN RFI 30BB)",
    data: require(`./advanced.json`),
  },
]
export default examples;

