/*eslint no-unused-vars: ["warn", { "varsIgnorePattern": "rng" }]*/
import React, { useState, useEffect } from "react";
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
  InputNumber, Divider
} from "antd";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, DownloadOutlined, FileAddFilled, CopyOutlined } from "@ant-design/icons"
import {
  Redirect,
  useHistory
} from "react-router-dom";
import { HandMatrix } from "@holdem-poker-tools/hand-matrix";
import Spin from "../components/Spin";
import Dropzone from "../components/Dropzone";
import { createRange, deleteRange, getRanges, registerListener } from "../data";
import colors from "../utils/colors";
import {actionComboStyler, frequencyComboStyler, downloadRange, readFile, validate} from "../utils/range";
import { getRandomInt } from "../utils/numbers";
import "./ViewRanges.css";
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ViewRanges = () => {
  const history = useHistory();
  const [ranges, setRanges] = useState([]);
  const [frequencyMode, setFrequencyMode] = useState(false);
  const [refreshRate, setRefreshRate] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [visible, setVisible] = useState(false);
  const [tags, setTags] = useState([]);

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
        return Object.assign([], e, {[idx !== -1 ? idx : e.length]: change.doc})
      })
    });

    return () => changes.cancel();
  }, [setRanges]);

  if (error) {
    return <Redirect to="/notfound" state={{}}/>
  }

  const parseRange = (file) => {
    return readFile(file)
      .then(JSON.parse)
      .then(range => {
        if (!validate(range)) throw new Error("Invalid range");
        return range;
      });
  }

  const handleImport = (files) => {
    return Promise.all(files.map(parseRange))
      .then(ranges => ranges.forEach(createNewRange))
      .then(() => message.success("Import successful!"))
      .catch(err => {
        console.log(err);
        message.error("One or more of your range files are invalid!");
      });
    ;
  }

  const handleSubmit = (data) => {
    return createNewRange(data)
      .then((doc) => {
        setVisible(false);
        history.push(`/range/${doc._id}`);
      });
  }

  const createNewRange = ({title, author, tags = [], combos = {}, actions = [
    {name: "Fold", color: colors[0].value, inRange: false},
    {name: "Call", color: colors[1].value, inRange: true},
    {name: "Raise", color: colors[2].value, inRange: true},
  ]}) => {
    return createRange({title, author, tags, combos, actions})
      .catch(err => {
        console.error(err);
        message.error("Could not create range!");
      })
    ;
  }

  const filteredRanges = ranges.filter(range => tags.length === 0 || tags.every(t => range.tags.includes(t)));

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
          {!frequencyMode && <span>RNG refresh rate: <InputNumber min={1} formatter={val => `${val} secs`} precision={0} onChange={setRefreshRate} value={refreshRate}/></span>}
        </Space>
        {
          filteredRanges.length === 0
            ? <div style={{textAlign: "center"}}>
              <Title level={3}>No Ranges Found</Title>
              {ranges.length === 0 && <Paragraph>You don't have any ranges yet!</Paragraph>}
            </div>
            : <Row gutter={[10, 10]}>
              {filteredRanges.map((range) => {
                return <Col key={range._id} xs={24} sm={12} md={8} lg={8} xl={6} xxl={4}>
                  <RangeTile refreshRate={refreshRate} range={range} frequencyMode={frequencyMode}/>
                </Col>
              })}
            </Row>
        }
      </Space> }
      <NewRangeFormModal onImport={handleImport} visible={visible} onSubmit={handleSubmit} onCancel={() => setVisible(false)}/>
    </div>
  )
}

const RangeTile = ({ range, frequencyMode, refreshRate }) => {
  const history = useHistory();
  const [rng, setRng] = useState(0);
  let {title, author, actions, combos, tags, _id} = range;

  useEffect(() => {
    setRng(getRandomInt());
    const interval = setInterval(() => {
      setRng(getRandomInt());
    },refreshRate * 1000);
    return () => clearInterval(interval);
  }, [refreshRate, setRng])

  const styler = frequencyMode
    ? actionComboStyler(combos, actions)
    : frequencyComboStyler(combos, actions);

  return (<div>
    <Text strong>{title} </Text>
    <Text type="secondary">by {author}</Text>
    <HandMatrix showText={true} comboStyle={combo => ({
      ...styler(combo),
      fontSize: "0.6rem"
    })} />
    <div style={{display: "flex"}}>
      <Tooltip title="Edit Range" placement="bottomLeft">
        <Button onClick={() => history.push(`range/${_id}`)} icon={<EditOutlined />} size="small"/>
      </Tooltip>
      <Tooltip title="Duplicate Range" placement="bottom">
        <Button onClick={() => createRange({title, author, actions, combos, tags})} icon={<CopyOutlined />} size="small"/>
      </Tooltip>
      <Tooltip title="Download Range" placement="bottom">
        <Button onClick={() => downloadRange(range)} icon={<DownloadOutlined />} size="small"/>
      </Tooltip>
      <div className="spacer"/>
      <Tooltip title="Delete Range" placement="bottomRight">
        <Button type="primary" onClick={() => deleteRange(_id)} icon={<DeleteOutlined />} size="small"/>
      </Tooltip>
    </div>
    <div className="tag-container">
      {tags.map(tag => <div className="tag" key={tag}>{tag}</div>)}
    </div>
  </div>)
}

const NewRangeFormModal = ({ visible, onSubmit, onImport, onCancel }) => {
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
      title="Add Range"
      visible={visible}
      okText="Create"
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Dropzone onDropFiles={onImport}>
        <div>
          <FileAddFilled style={{fontSize: 52}}/>
          <h3>Drop your range file(s) here</h3>
        </div>
      </Dropzone>
      <Divider/>
      <Form layout="vertical" form={form}>
        <Title level={5} style={{textAlign: "center"}}>Or create a range manually</Title>
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
