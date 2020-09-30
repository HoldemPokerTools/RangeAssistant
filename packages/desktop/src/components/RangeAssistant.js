import React, { useState, useEffect } from "react";
import { Button, Tooltip, Spin, Modal, Empty } from "antd";
import {
  RedoOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { HandMatrix } from "@holdem-poker-tools/ui-react";
import {
  getRanges,
  registerListener,
  deleteRange,
  deleteAllRanges,
} from "../data";
import RangeSearch from "./RangeSearch";
import "./RangeAssistant.module.css";
import logo from "./logo.png"

const getRandomInt = (min = 1, max = 100) => {
  min = Math.ceil(Math.max(1, min));
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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

function RangeAssistant() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [ranges, setRanges] = useState([]);
  const [rangeId, setRangeId] = useState(undefined);
  const [range, setRange] = useState(undefined);
  const [rng, setRng] = useState(0);
  const [value, setValue] = useState("");

  useEffect(() => {
    const refreshRanges = async () => {
      try {
        setRanges(await getRanges());
      } catch (err) {
        console.error(err);
        setError("Invalid range. Please close this window and try again");
      }
    };

    const load = async () => {
      try {
        setLoading(true);
        registerListener(refreshRanges);
        await refreshRanges();
      } catch (err) {
        console.error(err);
        setError("Invalid range. Please close this window and try again");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setRanges, setError, setLoading]);

  useEffect(() => {
    const loadRange = async () => {
      try {
        const selectedRange = ranges.find((r) => r._id === rangeId);
        if (!selectedRange) {
          setRangeId(undefined);
          setRange(undefined);
          setValue("");
        } else {
          const { combos, ...rest } = ranges.find((r) => r._id === rangeId);
          const processedRange = Object.keys(combos).reduce((acc, current) => {
            return { ...acc, [current]: getAction(combos[current]) };
          }, {});
          setRange({ combos: processedRange, ...rest });
        }
      } catch (err) {
        console.error(err);
        setError("Invalid range. Please close this window and try again");
      }
    };
    if (rangeId) {
      loadRange();
    }
  }, [setError, setRange, setValue, ranges, rangeId, rng]);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 10 }}>
        An error occurred, please close this window and try again. If the
        problem persists, you can delete all ranges from and reimport them.
        <div className="gutter"></div>
        <Button onClick={deleteAllRanges} type="danger">
          Delete All Ranges
        </Button>
      </div>
    );
  }

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 15 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
      </div>
    );

  if (!loading && !range && ranges.length === 0) {
    return (
      <div style={{ paddingTop: 30 }}>
        <Empty
          description={
            <span>
              No ranges found.
              <br />
              Import a range file (
              <kbd>{window.Ranges.isMac ? "Cmd" : "Ctrl"}</kbd>+<kbd>I</kbd>) or
              create a new one
            </span>
          }
          image={logo}
        >
          <Button href={"https://rangeassistant.holdempoker.tools"} type="primary">
            Create Now
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <RangeSearch
        ranges={ranges}
        onSelect={(id) => {
          setRangeId(id);
          setValue(ranges.find((r) => r._id === id).title);
        }}
        onChange={setValue}
        value={value}
        dropdownMatchSelectWidth="100%"
        style={{ width: "100%" }}
      />
      <div className="gutter"></div>
      {loading && (
        <div style={{ textAlign: "center" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
        </div>
      )}
      {!range && !loading && (
        <div style={{ textAlign: "center" }}>Select a range</div>
      )}
      {range && !loading && (
        <div>
          <Modal
            title="Range Help"
            visible={modalVisible}
            onOk={() => setModalVisible(false)}
            onCancel={() => setModalVisible(false)}
            style={{ top: 20 }}
            footer={[
              <Button
                key="submit"
                type="default"
                onClick={() => setModalVisible(false)}
              >
                Close
              </Button>,
            ]}
          >
            <div>
              {range.actions.map((action) => (
                <p key={action.name}>
                  <span
                    style={{
                      border: "1px solid lightgrey",
                      display: "inline-block",
                      height: 10,
                      width: 10,
                      backgroundColor: action.color,
                    }}
                  ></span>{" "}
                  {action.name}
                </p>
              ))}
            </div>
          </Modal>
          <div>
            <Tooltip
              title="Refresh RNG"
              placement="bottomLeft"
              arrowPointAtCenter={true}
            >
              <Button
                style={{ width: `${(1 / 13) * 100}%` }}
                disabled={loading}
                size="small"
                type="default"
                onClick={() => setRng(getRandomInt())}
                icon={<RedoOutlined />}
              />
            </Tooltip>
            <Tooltip title="Help" placement="bottomLeft">
              <Button
                style={{ width: `${(1 / 13) * 100}%` }}
                size="small"
                type="default"
                onClick={() => setModalVisible(true)}
                icon={<InfoCircleOutlined />}
              />
            </Tooltip>
            <Tooltip title="Delete Range" placement="bottomLeft">
              <Button
                style={{ width: `${(1 / 13) * 100}%` }}
                disabled={loading}
                size="small"
                type="default"
                icon={<DeleteOutlined />}
                onClick={() => deleteRange(rangeId)}
              />
            </Tooltip>
          </div>
          <HandMatrix
            showText={true}
            colorize={false}
            comboStyle={(combo) => ({
              fontSize: "3vw",
              backgroundColor: (
                range.actions.find((a, i) => {
                  if (range.combos[combo]) return i === range.combos[combo];
                  return false;
                }) || range.actions[0]
              ).color,
            })}
          />
        </div>
      )}
    </>
  );
}

export default RangeAssistant;
