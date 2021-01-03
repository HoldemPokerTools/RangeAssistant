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
} from "antd";
import Spin from "../components/Spin";
import { DeleteFilled, CopyOutlined, FormatPainterOutlined, TableOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { HandMatrix } from "@holdem-poker-tools/hand-matrix";
import { useParams, Redirect } from "react-router-dom";
import { actionComboStyler, combosToRangeString, defaultTags, rangeStringFormatters, validate } from "../utils/range";
import { filterUndefinedKeys } from "../utils/objects";
import colors from "../utils/colors";
import { getRange, updateRange } from "../data";
const { Title, Text } = Typography;
const { Option } = Select;

function BuildRange() {
  const [range, setRange] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(undefined);
  const [selected, setSelected] = useState(undefined);
  const [copying, setCopying] = useState(false);
  const [clipboard, setClipboard] = useState(undefined);
  const [weightedCombosInRange, setWeightedCombosInRange] = useState(undefined);
  const { rangeId } = useParams();

  useEffect(() => {
    setLoading(true);
    getRange(rangeId)
      .then(r => setRange(Object.fromEntries(
        Object.entries(r).filter(([k]) => !k.startsWith("_"))
      )))
      .catch(err => {
        console.error(err);
        setError("Unable to load range!");
      })
      .finally(() => setLoading(false));
  }, [setLoading, setError, rangeId]);

  useEffect(() => {
    const isValid = validate({_id: rangeId, ...range});
    if (range && !copying && isValid) {
      updateRange(rangeId, range).catch(console.error)
    } else console.debug(isValid.errors)
  }, [range, copying, rangeId]);

  useEffect(() => {
    if (range) {
      const { combos, actions } = range;
      setWeightedCombosInRange(Object.entries(combos).filter(([_, actionWeights]) => {
        return actionWeights.some((actionWeight, idx) => actions[idx].inRange && actionWeight > 0);
      }).map(([combo, actionWeights]) => {
        const totalWeights = actionWeights.reduce((acc, next) => acc + next,0);
        const inRangeTotal = actionWeights.reduce((acc, next, idx) => actions[idx].inRange ? acc + next : acc,0);
        return [combo, (inRangeTotal/totalWeights * 100).toFixed(2)]
      }));
    }
  }, [range])

  const handleComboActionChange = (combo, actionIdx, newValue) => {
    const { combos, actions } = range;
    const existing = [...(combos[combo] || actions.map((_) => 0))];
    const updatedCombos = {
      ...combos,
      [combo]: existing.map((val, idx) => (idx === actionIdx ? newValue : val)),
    };
    setRange(e => ({...e, combos: filterUndefinedKeys(updatedCombos)}));
  };

  const handleActionChange = (idx, updates) => {
    setRange(e => {
      let updatedActions = [...e.actions];
      updatedActions[idx] = {
        ...e.actions[idx],
        ...updates,
      };
      return {...e, actions: updatedActions};
    });
  };

  const addAction = () => {
    const availableColors = colors.filter(
      (c) => range.actions.map((a) => a.color).indexOf(c.value) === -1
    );
    setRange(e => ({
      ...e,
      actions: [
        ...e.actions,
        { name: "New Action", color: availableColors[0].value, inRange: true },
      ],
      combos: Object.entries(e.combos).reduce((acc, [k, v]) => {
        return {
          ...acc,
          [k]: v.concat([0]),
        };
      }, {})
    }));
    setClipboard(undefined);
  };

  const removeAction = (idx) => {
    setRange(e => ({
      ...e,
      actions: [...e.actions.slice(0, idx), ...e.actions.slice(idx + 1)],
      combos: Object.entries(e.combos).reduce((acc, [k, v]) => {
        const newValue = v.filter((_, i) => i !== idx);
        if (newValue.every((val) => val === 0)) return acc;
        return {
          ...acc,
          [k]: newValue,
        };
      }, {})
    }));
    setClipboard(undefined);
  };

  const handleSelect = (val) => {
    setSelected(val);
    setCopying(true);
  }

  const handleMouseEnter = (val) => {
    if (selected && copying) {
      setRange(e => ({
        ...e,
        combos: filterUndefinedKeys({
          ...e.combos,
          [val]: e.combos[selected]
        })
      }));
    }
  }

  const handlePaste = () => {
    setRange(e => ({
      ...e,
      combos: filterUndefinedKeys({
        ...e.combos,
        [selected]: clipboard
      })
    }));
  }

  const handleSimplePropChange = (prop) => (value) => setRange(e => ({...e, [prop]: value}));

  if (error) {
    return <Redirect to="/notfound" state={{}}/>
  }

  if (loading) {
    return <div style={{textAlign: "center"}}><Spin/> Loading...</div>
  }

  return (
    <div>
      <Space style={{width: "100%"}} direction="vertical">
        <div>
          <Title level={3} editable={{ onChange: handleSimplePropChange("title") }}>{range.title}</Title>
          <Text editable={{ onChange: handleSimplePropChange("author") }}>{range.author}</Text>
        </div>
        <div>
          <Title level={4}>
            Tags
          </Title>
          <Text>
            Use tags for hero position, villain position, bet size etc. to help when searching for a specific
            range. You can use the default tags or add your own new tags.
          </Text>
          <Select value={range.tags} placeholder="Select tags..." mode="tags" style={{ width: '100%' }} onChange={handleSimplePropChange("tags")} tokenSeparators={[',']}>
            {[...new Set(defaultTags.concat(range.tags))].map(tag => <Option key={tag} value={tag}>{tag}</Option>)}
          </Select>
        </div>
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
                comboStyle={combo => ({
                  ...actionComboStyler(range.combos, range.actions)(combo),
                  boxShadow:
                    combo === selected ? "inset 0px 0px 0px 5px #fff" : "none",
                })}
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
              {range.actions.map((action, idx) => (
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
                    disabled={range.actions.length === 1 || idx === 0}
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
                disabled={range.actions.length === colors.length}
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
                  {range.actions.map((action, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center" }}>
                      <span style={{
                        border: "1px solid lightgrey",
                        marginRight: 10,
                        height: 20,
                        width: 20,
                        backgroundColor: action.color,
                      }}/>
                      <InputNumber
                        value={range.combos[selected] ? range.combos[selected][i] : 0}
                        min={0}
                        onChange={(val) =>
                          handleComboActionChange(selected, i, val)
                        }
                      />
                    </div>
                  ))}
                  {(range.combos[selected] || clipboard) && <Space>
                    {range.combos[selected] && <Button onClick={() => setClipboard(range.combos[selected])} icon={<CopyOutlined />}>Copy</Button>}
                    {clipboard && <Button onClick={handlePaste} icon={<FormatPainterOutlined />}>Paste</Button>}
                  </Space>}
                </Space>
              )}
              <div>
                <Title level={4}>
                  Copy Range String
                </Title>
                {
                  weightedCombosInRange.length
                    ? <Space>
                        {
                          Object.keys(rangeStringFormatters).map(i =>
                            <Text  style={{overflowWrap: "anywhere"}} copyable={{text: combosToRangeString(weightedCombosInRange, i)}}>
                            {rangeStringFormatters[i].label}
                            </Text>
                          )
                        }
                      </Space>
                    : <Text>
                      <ExclamationCircleOutlined /> To generate a range string, ensure at least one combo has an action
                      weight greater than 0 for at least one action which is marked as <strong>included in range</strong>
                    </Text>
                }
              </div>
            </Space>
          </Col>
        </Row>
      </Space>
    </div>
  );
}

export default BuildRange;
