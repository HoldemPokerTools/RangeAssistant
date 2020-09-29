import React, { useState, useEffect } from "react";
import {
  Empty,
  Button,
  InputNumber,
  Row,
  Col,
  Typography,
  Space,
  Input,
  Select,
} from "antd";
import { DeleteFilled, CopyOutlined, FormatPainterOutlined } from "@ant-design/icons";
import { HandMatrix } from "@holdem-poker-tools/ui-react";
import basicRange from "../ranges/basic.json";
const { Title, Text } = Typography;
const { Option } = Select;

const colors = [
  { value: "#d3d3d3", name: "Grey" },
  { value: "#e89679", name: "Peach" },
  { value: "#d9e90e", name: "Yellow" },
  { value: "#7ec78e", name: "Green" },
  { value: "#6d9ec2", name: "Blue" },
  { value: "#bb63fd", name: "Purple" },
  { value: "#fd6363", name: "Red" },
  { value: "#ea9900", name: "Orange" },
  { value: "#46cec0", name: "Turquoise" },
  { value: "#ffffff", name: "White" },
  { value: "#e09cc5", name: "Pink" },
  { value: "#8a0000", name: "Maroon" },
  { value: "#06ce0c", name: "Bright Green" },
];

const filterUndefinedKeys = (obj) => Object.keys(obj).reduce((acc, key) => {
  if (obj[key] === undefined || (Array.isArray(obj[key]) && obj[key].every(v => v === 0))) return acc;
  return {...acc, [key]: obj[key]};
}, {});

function RangeBuilder({ onChange }) {
  const [actions, setActions] = useState([{"name":"Fold","color":"#d3d3d3"},{"name":"Shove <= 25BB","color":"#7ec78e"},{"name":"Shove <= 20BB","color":"#e89679"},{"name":"Shove <= 15BB","color":"#d9e90e"},{"name":"Shove <= 10BB","color":"#bb63fd"},{"name":"Shove <= 5BB","color":"#6d9ec2"}]);
  const [range, setRange] = useState({"22":[0,0,0,0,0,1],"33":[0,0,0,0,1,0],"44":[0,0,0,0,1,0],"55":[0,0,1,0,0,0],"66":[0,0,1,0,0,0],"77":[0,0,0,1,0,0],"88":[0,0,1,0,0,0],"99":[0,0,1,0,0,0],"AA":[0,1,0,0,0,0],"AJs":[0,1,0,0,0,0],"AKo":[0,1,0,0,0,0],"AKs":[0,1,0,0,0,0],"AQo":[0,1,0,0,0,0],"AQs":[0,1,0,0,0,0],"ATs":[0,1,0,0,0,0],"JJ":[0,1,0,0,0,0],"KJs":[0,1,0,0,0,0],"KK":[0,1,0,0,0,0],"KQs":[0,1,0,0,0,0],"QQ":[0,1,0,0,0,0],"TT":[0,1,0,0,0,0],"A7s":[0,0,0,0,1,0],"A4s":[0,0,0,0,1,0],"KTs":[0,0,1,0,0,0],"QTs":[0,0,1,0,0,0],"JTs":[0,0,1,0,0,0],"K9s":[0,0,0,1,0,0],"Q9s":[0,0,0,0,1,0],"AJo":[0,0,1,0,0,0],"ATo":[0,0,0,0,1,0],"A9o":[0,0,0,0,0,1],"A8o":[0,0,0,0,0,1],"A7o":[0,0,0,0,0,1],"T8s":[0,0,0,0,0,1],"K7s":[0,0,0,0,0,1],"A3s":[0,0,0,0,0,1],"A2s":[0,0,0,0,0,1],"QJo":[0,0,0,0,0,1],"KTo":[0,0,0,0,0,1],"QJs":[0,1,0,0,0,0],"A9s":[0,0,1,0,0,0],"J9s":[0,0,0,1,0,0],"A8s":[0,0,0,1,0,0],"A5s":[0,0,0,1,0,0],"KQo":[0,0,0,1,0,0],"T9s":[0,0,0,1,0,0],"A6s":[0,0,0,0,1,0],"98s":[0,0,0,0,1,0],"KJo":[0,0,0,0,1,0],"K8s":[0,0,0,0,0,1],"K6s":[0,0,0,0,0,1],"K5s":[0,0,0,0,0,1],"Q8s":[0,0,0,0,0,1],"87s":[0,0,0,0,0,1],"QTo":[0,0,0,0,0,1],"A6o":[0,0,0,0,0,1],"A5o":[0,0,0,0,0,1]});
  const [selected, setSelected] = useState(undefined);
  const [copying, setCopying] = useState(false);
  const [clipboard, setClipboard] = useState(undefined);

  useEffect(() => {
    onChange({ actions, range });
  }, [range, actions, onChange]);

  const handleComboActionChange = (combo, actionIdx, newValue) => {
    const existing = [...(range[combo] || actions.map((_) => 0))];
    const updatedRange = {
      ...range,
      [combo]: existing.map((val, idx) => (idx === actionIdx ? newValue : val)),
    };
    setRange(filterUndefinedKeys(updatedRange));
  };

  const handleActionChange = (idx, updates) => {
    setActions((e) => {
      let items = [...e];
      items[idx] = {
        ...e[idx],
        ...updates,
      };
      return items;
    });
  };

  const addAction = () => {
    const availableColors = colors.filter(
      (c) => actions.map((a) => a.color).indexOf(c.value) === -1
    );
    setActions((e) => [
      ...e,
      { name: "New Action", color: availableColors[0].value },
    ]);
    setRange((e) =>
      Object.entries(e).reduce((acc, [k, v]) => {
        return {
          ...acc,
          [k]: v.concat([0]),
        };
      }, {})
    );
    setClipboard(undefined);
  };

  const removeAction = (idx) => {
    setActions((e) => [...e.slice(0, idx), ...e.slice(idx + 1)]);
    setRange((e) =>
      Object.entries(e).reduce((acc, [k, v]) => {
        const newValue = v.filter((_, i) => i !== idx);
        if (newValue.every((val) => val === 0)) return acc;
        return {
          ...acc,
          [k]: newValue,
        };
      }, {})
    );
    setClipboard(undefined);
  };

  const handleSelect = (val) => {
    setSelected(val);
    setCopying(true);
  }

  const handleMouseEnter = (val) => {
    if (selected && copying) {
      setRange(e => filterUndefinedKeys({
        ...e,
        [val]: e[selected]
      }));
    }
  }

  const handlePaste = () => {
    setRange(e => filterUndefinedKeys({
      ...e,
      [selected]: clipboard
    }));
  }

  return (
    <Row gutter={[15, 15]}>
      <Col
        xs={{ span: 24, offset: 0 }}
        sm={{ span: 16, offset: 4 }}
        md={{ span: 12, offset: 0 }}
        lg={12}
        xl={12}
      >
        <Space style={{ width: "100%" }} direction="vertical">
          <Title level={4}>Combos</Title>
          <HandMatrix
            colorize={false}
            onMouseDown={handleSelect}
            onMouseUp={() => setCopying(false)}
            onMouseEnter={handleMouseEnter}
            comboStyle={(combo) => {
              let bgString;
              if (!range[combo]) bgString = actions[0].color;
              else {
                bgString = "linear-gradient(to top";
                const total = range[combo].reduce((a, b) => a + b, 0);
                const percentages = range[combo].map((c) => (c / total) * 100);
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
                boxShadow:
                  combo === selected ? "inset 0px 0px 0px 5px #fff" : "none",
                background: bgString,
              };
            }}
          />
          <Text><strong>Pro Tip:</strong> You can "drag" a combo to copy it's action weights to another combo.</Text>
        </Space>
      </Col>
      <Col
        xs={{ span: 24, offset: 0 }}
        sm={{ span: 16, offset: 4 }}
        md={{ span: 12, offset: 0 }}
        lg={12}
        xl={12}
      >
        <Space style={{ width: "100%" }} direction="vertical">
          <Title level={4}>Actions</Title>
          {actions.map((action, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Input
                style={{ flexGrow: 1 }}
                value={action.name}
                onChange={(e) =>
                  handleActionChange(idx, { name: e.target.value })
                }
              />
              <Select
                value={action.color}
                onSelect={(val) => handleActionChange(idx, { color: val })}
              >
                {colors.map((c) => (
                  <Option key={c.value} value={c.value}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          border: "1px solid lightgrey",
                          marginRight: 10,
                          minHeight: 20,
                          minWidth: 20,
                          backgroundColor: c.value,
                        }}
                      ></span>{" "}
                      {c.name}
                    </div>
                  </Option>
                ))}
              </Select>
              <Button
                type="danger"
                disabled={actions.length === 1}
                onClick={() => removeAction(idx)}
              >
                <DeleteFilled />
              </Button>
            </div>
          ))}
          <Button
            onClick={addAction}
            type="dashed"
            disabled={actions.length === colors.length}
          >
            Add Action
          </Button>
          {!selected ? (
            <Empty description="Select a combo to configure" />
          ) : (
            <Space style={{ width: "100%" }} direction="vertical">
              <Title level={4}>
                Combo Action Weights: {selected}
              </Title>
              {actions.map((action, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      border: "1px solid lightgrey",
                      marginRight: 10,
                      height: 20,
                      width: 20,
                      backgroundColor: action.color,
                    }}
                  ></span>
                  <InputNumber
                    value={range[selected] ? range[selected][i] : 0}
                    onChange={(val) =>
                      handleComboActionChange(selected, i, val)
                    }
                  />
                </div>
              ))}
              <Space>
                {range[selected] && <Button onClick={() => setClipboard(range[selected])} icon={<CopyOutlined />}>Copy</Button>}
                {clipboard && <Button onClick={handlePaste} icon={<FormatPainterOutlined />}>Paste</Button>}
              </Space>
            </Space>
          )}
        </Space>
      </Col>
    </Row>
  );
}

export default RangeBuilder;
