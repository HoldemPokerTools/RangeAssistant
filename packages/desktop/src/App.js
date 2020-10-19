import React, { useEffect } from "react";
import RangeAssistant from "./components/RangeAssistant";
import Dropzone from "./components/Dropzone";
import { message } from 'antd';
import { storeRange } from "./data";
import "./App.css";
const { Ranges } = window;
const App = () => {
  useEffect(() => {
    message.config({ top: "80%", maxCount: 1, duration: 1.5 })
    Ranges.onAdd((range) => {
      storeRange(range)
        .then(_ => message.success('Range added!'))
        .catch(_ => message.error('Error adding range!'));
    });
  }, []);
  return <Dropzone>
    <RangeAssistant />
  </Dropzone>;
};

export default App;
