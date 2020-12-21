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
  Switch,
  Tooltip,
  Radio,
  message,
} from "antd";
import { DeleteFilled, CopyOutlined, FormatPainterOutlined, TableOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { HandMatrix } from "@holdem-poker-tools/hand-matrix";
import {reverse} from "prange";
import copy from 'copy-to-clipboard';
const { Title, Text } = Typography;
const { Option } = Select;

const colors = [
  { value: "#d3d3d3", name: "Grey" },
  { value: "#7ec78e", name: "Green" },
  { value: "#d9e90e", name: "Yellow" },
  { value: "#e89679", name: "Peach" },
  { value: "#6d9ec2", name: "Blue" },
  { value: "#bb63fd", name: "Purple" },
  { value: "#fd6363", name: "Red" },
  { value: "#ea9900", name: "Orange" },
  { value: "#46cec0", name: "Turquoise" },
  { value: "#ffffff", name: "White" },
  { value: "#e09cc5", name: "Pink" },
  { value: "#8a0000", name: "Maroon" },
  { value: "#06ce0c", name: "Bright Green" },
  { value: "#1b9af7", name: "Bright Blue" },
];

const supportedRangeStringFormats = [
  {label: "GTO+", value: "gtoplus", getWeightedRangeString: (rangeString, weight) => `[${weight}]${rangeString}[/${weight}]`}
]

const filterUndefinedKeys = (obj) => Object.keys(obj).reduce((acc, key) => {
  if (obj[key] === undefined || (Array.isArray(obj[key]) && obj[key].every(v => v === 0))) return acc;
  return {...acc, [key]: obj[key]};
}, {});

const combosToRangeString = (weightedCombos, format="gtoplus") => {
  const getWeightedRangeString = supportedRangeStringFormats.find(i => i.value === format).getWeightedRangeString
  const weightCombosMap = weightedCombos.reduce((acc, [combo, weight]) => {
    return {
      ...acc,
      [weight]: (acc[weight] || []).concat([combo])
    }
  }, {});
  return Object
    .entries(weightCombosMap)
    .map(([weight, combos]) => parseInt(weight) === 100 ? reverse(combos) : getWeightedRangeString(reverse(combos), weight))
    .join(",");
}

function RangeBuilder({ onChange, init }) {
  const [actions, setActions] = useState(init.actions || [
    {name: "Fold", color: "#d3d3d3", inRange: false},
    {name: "Call", color: "#d9e90e", inRange: true},
    {name: "Raise", color: "#e89679", inRange: true},
  ]);
  const [range, setRange] = useState(init.range || {});
  const [selected, setSelected] = useState(undefined);
  const [copying, setCopying] = useState(false);
  const [clipboard, setClipboard] = useState(undefined);
  const [rangeString, setRangeString] = useState(undefined);
  const [format, setFormat] = useState("gtoplus");

  useEffect(() => {
    onChange({ actions, range });
  }, [range, actions, onChange]);

  useEffect(() => {
    init.range && setRange(init.range);
    init.actions && setActions(init.actions);
  }, [init]);

  useEffect(() => {
    const weightedCombosInRange = Object.entries(range).filter(([_, actionWeights]) => {
      return actionWeights.some((actionWeight, idx) => actions[idx].inRange && actionWeight > 0);
    }).map(([combo, actionWeights]) => {
      const totalWeights = actionWeights.reduce((acc, next) => acc + next,0);
      const inRangeTotal = actionWeights.reduce((acc, next, idx) => actions[idx].inRange ? acc + next : acc,0);
      return [combo, Math.round(inRangeTotal/totalWeights * 100)]
    });
    if (!weightedCombosInRange.length) setRangeString(undefined)
    else setRangeString(combosToRangeString(weightedCombosInRange));
  }, [range, actions])

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
      { name: "New Action", color: availableColors[0].value, inRange: true },
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

  const copyToClipboard = (val) => {
    copy(val);
    message.info("Copied to Clipboard!");
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
            onPointerDown={handleSelect}
            onPointerUp={() => setCopying(false)}
            onPointerEnter={handleMouseEnter}
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
                disabled={idx === 0}
                size="large"
                style={{ flexGrow: 1 }}
                value={action.name}
                onChange={(e) =>
                  handleActionChange(idx, { name: e.target.value })
                }
              />
              <Select
                size="large"
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
                        />{" "}
                      {c.name}
                    </div>
                  </Option>
                ))}
              </Select>
              <Button
                type="danger"
                size="large"
                disabled={actions.length === 1 || idx === 0}
                onClick={() => removeAction(idx)}
              >
                <DeleteFilled />
              </Button>
              <div style={{marginLeft: 5}}>
                <Tooltip placement="topRight" title="Include in range string">
                  <Switch
                    disabled={idx === 0}
                    onChange={checked => handleActionChange(idx, { inRange: checked })}
                    checkedChildren={<TableOutlined />}
                    checked={action.inRange}
                  />
                </Tooltip>
              </div>
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
                  <span style={{
                    border: "1px solid lightgrey",
                    marginRight: 10,
                    height: 20,
                    width: 20,
                    backgroundColor: action.color,
                  }}/>
                  <InputNumber
                    value={range[selected] ? range[selected][i] : 0}
                    min={0}
                    onChange={(val) =>
                      handleComboActionChange(selected, i, val)
                    }
                  />
                </div>
              ))}
              {(range[selected] || clipboard) && <Space>
                {range[selected] && <Button onClick={() => setClipboard(range[selected])} icon={<CopyOutlined />}>Copy</Button>}
                {clipboard && <Button onClick={handlePaste} icon={<FormatPainterOutlined />}>Paste</Button>}
              </Space>}
            </Space>
          )}
          <div>
            <Title level={4}>
              Range String
            </Title>
            {
              rangeString ? <Space direction="vertical">
                <Space>
                  <Text strong>Format</Text>
                  <Radio.Group onChange={setFormat} options={supportedRangeStringFormats} value={format}/>
                </Space>
                <Space>
                  <Space><Button onClick={() => copyToClipboard(rangeString)} icon={<CopyOutlined />}>Copy</Button></Space>
                  <Text>{rangeString}</Text>
                </Space>
              </Space> :
                <Text>
                  <ExclamationCircleOutlined /> To generate a range string, ensure at least one combo has an action
                  weight greater than 0 for at least one action which is marked as <strong>included in range</strong>
                </Text>
            }
          </div>
        </Space>
      </Col>
    </Row>
  );
}

export default RangeBuilder;
