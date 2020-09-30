export default [
  {
    value: 'push_fold',
    label: 'Push/Fold',
    children: [
      {
        value: 'FR',
        label: 'Full Ring',
        children: ["UTG", "UTG1", "UTG2", "LJ", "HJ", "CO", "BTN"].map(position => ({
          value: position,
          label: position,
          children: [
            {
              value: 'noante',
              label: 'No Ante',
              children: [
                {
                  data: require(`./push_fold/FR/${position}/noante/20bb`),
                  value: `20BB`,
                  label: '20BB'
                },
                {
                  data: require(`./push_fold/FR/${position}/noante/15bb`),
                  value: `15BB`,
                  label: '15BB'
                },
                {
                  data: require(`./push_fold/FR/${position}/noante/10bb`),
                  value: `push_fold/FR/${position}/noante/10BB`,
                  label: '10BB'
                },
                {
                  data: require(`./push_fold/FR/${position}/noante/5bb`),
                  value: `push_fold/FR/${position}/noante/5BB`,
                  label: '5BB'
                },
              ]
            },
            {
              value: 'ante10',
              label: '10% Ante',
              children: [
                {
                  data: require(`./push_fold/FR/${position}/ante10/20bb`),
                  value: `20BB`,
                  label: '20BB'
                },
                {
                  data: require(`./push_fold/FR/${position}/ante10/15bb`),
                  value: `15BB`,
                  label: '15BB'
                },
                {
                  data: require(`./push_fold/FR/${position}/ante10/10bb`),
                  value: `10BB`,
                  label: '10BB'
                },
                {
                  data: require(`./push_fold/FR/${position}/ante10/5bb`),
                  value: `5BB`,
                  label: '5BB'
                },
              ]
            }
          ]
        }))
      }
    ]
  }
]

