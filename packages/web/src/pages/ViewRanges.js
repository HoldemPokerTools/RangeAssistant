import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Typography,
  Modal,
  Form,
  Input,
  message,
  Space,
  Row,
  Col,
  Switch,
  Select,
  Tooltip,
  InputNumber
} from "antd";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, DownloadOutlined } from "@ant-design/icons"
import {
  Redirect,
  useHistory
} from "react-router-dom";
import { HandMatrix } from "@holdem-poker-tools/hand-matrix";
import Spin from "../components/Spin";
import { createRange, deleteRange, getRanges, registerListener } from "../data";
import colors from "../utils/colors";
import { actionComboStyler, frequencyComboStyler, downloadRange } from "../utils/range";
import { getRandomInt } from "../utils/numbers";
import "./ViewRanges.css";
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ViewRanges = () => {
  const history = useHistory();
  const [ranges, setRanges] = useState([]);
  const [frequencyMode, setFrequencyMode] = useState(false);
  const [rng, setRng] = useState(5);
  const [refreshRate, setRefreshRate] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [visible, setVisible] = useState(false);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setRng(getRandomInt())
    const interval = setInterval(() => {
      setRng(getRandomInt());
    },refreshRate * 1000);
    return () => clearInterval(interval);
  }, [refreshRate, setRng])

  useEffect(() => {
    setLoading(true);
    getRanges()
      .then(setRanges)
      .catch(err => {
        console.error(err);
        setError("Unable to load ranges!");
      })
      .finally(() => setLoading(false));
  }, [setLoading, setError, setRanges]);

  useEffect(() => {
    const changes = registerListener((change) => {
      setRanges(e => {
        if (change.deleted) {
          return e.filter(i => i._id !== change.id);
        }
        const idx = e.findIndex(i => i._id === change.id);
        if (idx !== -1) {
          return Object.assign([], e, {[idx]: change.doc});
        }
      })
    });

    return () => changes.cancel();
  }, [setRanges]);

  if (error) {
    return <Redirect to="/notfound" state={{}}/>
  }

  const createNewRange = ({title, author}) => {
    createRange({title, author, tags: [], combos: {}, actions: [
        {name: "Fold", color: colors[0].value, inRange: false},
        {name: "Call", color: colors[1].value, inRange: true},
        {name: "Raise", color: colors[2].value, inRange: true},
      ]})
      .then((doc) => {
        history.push(`/range/${doc._id}`);
      })
      .catch(err => {
        console.error(err);
        message.error("Could not create range!");
      })
    ;
  }

  return (
    <div>
      { loading && <div style={{textAlign: "center"}}><Spin/> Loading...</div> }
      { !loading && <Space direction="vertical" style={{width: "100%"}}>
        <div className="view-ranges-controls">
          <Space>
            <Select value={tags} placeholder="Filter by tags..." mode="multiple" allowClear onChange={setTags}>
              {[...new Set((ranges || []).map(range => range.tags).flat())].sort().map(tag => <Option key={tag} value={tag}>{tag}</Option>)}
            </Select>
            <Button icon={<PlusCircleOutlined/>} onClick={() => setVisible(true)}>Add Range</Button>
          </Space>
        </div>
        <Space>
          <span>Display Frequencies: <Switch checked={frequencyMode} onChange={setFrequencyMode}/></span>
          {!frequencyMode && <span>RNG refresh rate: <InputNumber formatter={val => `${val} secs`} precision={0} onChange={setRefreshRate} value={refreshRate}/></span>}
        </Space>
        {
          ranges.length === 0
            ? <div style={{textAlign: "center"}}>
              <Title level={3}>No Ranges Found</Title>
              <Paragraph>You don't have any ranges yet!</Paragraph>
            </div>
            : <Row gutter={[10, 10]}>
              {ranges.filter(range => tags.length === 0 || tags.every(t => range.tags.includes(t))).map((range) => {
                return <Col key={range._id} xs={12} sm={12} md={6} lg={6} xl={4}>
                  <RangeTile rng={rng} range={range} frequencyMode={frequencyMode}/>
                </Col>
              })}
            </Row>
        }
      </Space> }
      <NewRangeFormModal visible={visible} onSubmit={createNewRange} onCancel={() => setVisible(false)}/>
    </div>
  )
}

const RangeTile = ({ range, frequencyMode, rng }) => {
  const history = useHistory();

  const getStyler = useCallback(() => {
    return frequencyMode
      ? actionComboStyler(range.combos, range.actions)
      : frequencyComboStyler(range.combos, range.actions)
  }, [range, frequencyMode, rng])

  return (<div>
    <HandMatrix showText={false} comboStyle={getStyler()} />
    <Text strong>{range.title}</Text>
    <br/>
    <Text type="secondary">by {range.author}</Text>
    <div style={{display: "flex"}}>
      <Tooltip title="Edit Range" placement="bottomLeft">
        <Button onClick={() => history.push(`range/${range._id}`)} icon={<EditOutlined />} size="small"/>
      </Tooltip>
      <Tooltip title="Download Range" placement="bottom">
        <Button onClick={() => downloadRange(range)} icon={<DownloadOutlined />} size="small"/>
      </Tooltip>
      <div className="spacer"/>
      <Tooltip title="Delete Range" placement="bottomRight">
        <Button type="primary" onClick={() => deleteRange(range._id)} icon={<DeleteOutlined />} size="small"/>
      </Tooltip>
    </div>
    <div className="tag-container">
      {range.tags.map(tag => <div className="tag" key={tag}>{tag}</div>)}
    </div>
  </div>)
}

const NewRangeFormModal = ({ visible, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then(onSubmit)
      .then(() => form.resetFields())
      .catch(console.debug)
  }

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="New Range"
      visible={visible}
      okText="Create"
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Range Name"
          required
          name="title"
          rules={[
            {
              required: true,
              message: "Please input a valid name for this range",
              min: 1,
              max: 80,
            },
          ]}
        >
          <Input placeholder="6 Max Cash UTG RFI" />
        </Form.Item>
        <Form.Item
          label="Range Author"
          required
          name="author"
          rules={[
            {
              required: true,
              message: "Please input an author for this range",
              min: 1,
              max: 48,
            },
          ]}
        >
          <Input placeholder="Your Name" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ViewRanges;
