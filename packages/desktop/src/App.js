import React, { useEffect } from 'react';
import RangeAssistant from './components/RangeAssistant';
import { storeRange } from './data';
import './App.css';
const { Ranges } = window;
const App = () => {
  useEffect(() => {
    Ranges.onAdd(storeRange);
  }, [])
  return <RangeAssistant/>
}


export default App;
