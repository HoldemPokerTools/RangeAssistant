import React, { useState, useEffect } from "react";
import {
  Layout,
  Modal,
  Space,
  Input,
  Button,
  Form,
  message,
  Typography,
  Alert,
  Cascader
} from "antd";
import { DownloadOutlined, GithubOutlined, AppleFilled, WindowsFilled } from "@ant-design/icons";
import { nanoid } from "nanoid";
import { UAParser } from "ua-parser-js";
import fileDownload from "js-file-download";
import RangeBuilder from "./components/RangeBuilder";
import { validateActions, validateCombos } from "./ranges/validator";
import examples from "./examples";
import "./App.css";
const { Text, Link } = Typography;

const parser = new UAParser();
const { Header, Footer, Content } = Layout;

const getOSIcon = (os) => {
  switch (os) {
    case "Mac":
      return <AppleFilled />;
    case "Windows":
      return <WindowsFilled/>
    default:
      return <></>;
  }
};

const getOSAppExtensionIcon = (os) => {
  switch (os) {
    case "Mac":
      return "dmg";
    case "Windows":
      return "exe"
    default:
      throw new Error(`Unsupported OS: ${os}`);
  }
};

const os = ["Mac", "Windows"].find(
  (i) => (parser.getOS().name || "").indexOf(i) !== -1
);

const onSave = (data) => {
  const range = { ...data, _id: nanoid() };
  fileDownload(range, `${data.title.toLowerCase().replace(/\s+/g, "-")}.range`, "application/json");
};

function App() {
  const [actions, setActions] = useState(undefined);
  const [combos, setCombos] = useState(undefined);
  const [init, setInit] = useState({});
  const [visible, setVisible] = useState(false);
  const [isSaveable, setIsSaveable] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsSaveable(validateActions(actions) && validateCombos(combos));
  }, [actions, combos, setIsSaveable]);

  const handleOk = (e) => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        try {
          onSave({ ...values, combos, actions });
          message.success("Range saved!");
        } catch {
          message.error("Could not save range!");
        } finally {
          setVisible(false);
        }
      })
      .catch((info) => {
        console.debug("Validate Failed:", info);
      });
  };

  const handleCancel = (e) => {
    form.resetFields();
    setVisible(false);
  };

  const loadExample = (examplePath) => {
    if (examplePath.length) {
      const data = examplePath.reduce((acc, next) => {
        return acc.children.find(i => i.value === next);
      }, {children: examples}).data;
      setInit({
        actions: data.actions,
        range: data.combos
      });
    }
  }

  const filter = (inputValue, path) => {
    const searchParts = inputValue.split(" ");
    return searchParts.every(part => path.some(option => option.label.toLowerCase().indexOf(part.toLowerCase()) > -1));
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="site-layout-header">
        <img
          alt="logo"
          height="60"
          src="./logo512.png"
        />
        <div className="logo-text">
          <span>Hold'em Poker Tools</span>
          <br/>
          <span style={{ color: "#bd2829"}}>Range Assistant</span>
        </div>
        <div className="spacer"></div>
        <Space>
          <Cascader style={{width: 275}} showSearch={{matchInputWidth: false, filter}} options={examples} onChange={loadExample} placeholder="Choose an Example..." />
          {os && (
            <Button href={`https://github.com/HoldemPokerTools/RangeAssistant/releases/latest/download/Range-Assistant.${getOSAppExtensionIcon(os)}`} target="_blank">
              Download Range Assistant for {getOSIcon(os)} {os}
            </Button>
          )}
          <Button
            className="export-button"
            onClick={() => setVisible(true)}
            disabled={!isSaveable}
            type="primary"
          >
            Save Range <DownloadOutlined />
          </Button>
        </Space>
      </Header>
      <Content className="content">
        <div className="site-layout-content">
          {!localStorage.getItem("showIntro") && (
            <Alert
              type="info"
              closable
              afterClose={() => {
                localStorage.setItem("showIntro", 1);
              }}
              showIcon
              message="First time here?"
              description={<Text>
                Use this web app to construct a new range then save it to use with the Hold'em Poker Tools Range Assistant desktop app.
                If you're on desktop, you can download the Range Assistant desktop app using the button above.
              </Text>}
            />
          )}
          <div className="gutter" />
          <RangeBuilder
            init={init}
            onChange={(data) => {
              setCombos(data.range);
              setActions(data.actions);
            }}
          />
        </div>
      </Content>
      <Modal
        title="Save Range"
        visible={visible}
        okText="Save"
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
                max: 24,
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
                max: 16,
              },
            ]}
          >
            <Input placeholder="Your Name" />
          </Form.Item>
        </Form>
      </Modal>
      <Footer style={{ textAlign: "center" }}>
        <Text>Hold'em Poker Tools: Range Assistant ©2020</Text>
        <br />
        <Text>
          Hold'em Poker Tools projects are free for everyone to use. Show you support on Buy Me
          a Coffee!
        </Text>
        <br />
        <Space>
          <Link href="https://www.buymeacoffee.com/holdemtools" target="_blank">
            <img
              src="https://cdn.buymeacoffee.com/buttons/default-red.png"
              alt="Buy Me A Coffee"
              style={{ height: 41, width: 174, borderRadius: 5 }}
            />
          </Link>
          <Link
            href="https://github.com/HoldemTools/RangeAssistant"
            target="_blank"
          >
            <GithubOutlined /> View on GitHub
          </Link>
        </Space>
      </Footer>
    </Layout>
  );
}

export default App;
