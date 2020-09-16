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
} from "antd";
import { ExportOutlined, GithubOutlined, AppleFilled } from "@ant-design/icons";
import RangeBuilder from "./components/RangeBuilder";
import { validateActions, validateCombos } from "./ranges/validator";
import { nanoid } from "nanoid";
import { UAParser } from "ua-parser-js";
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

const onExport = (data) => {
  const range = { ...data, _id: nanoid() };
  const url = window.URL.createObjectURL(
    new Blob([JSON.stringify(range)], {
      type: "application/json",
    })
  );
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `${data.title.toLowerCase().replace(/\s+/g, "-")}.range`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

function App() {
  const [actions, setActions] = useState([]);
  const [combos, setCombos] = useState({});
  const [visible, setVisible] = useState(false);
  const [isExportable, setIsExportable] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsExportable(validateActions(actions) && validateCombos(combos));
  }, [actions, combos, setIsExportable]);

  const handleOk = (e) => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        try {
          onExport({ ...values, combos, actions });
          message.success("Range exported!");
        } catch {
          message.error("Could not export range!");
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
        <Space>
          {os && (
            <Button href={`https://github.com/HoldemPokerTools/RangeAssistant/releases/latest/download/Range%20Assistant.${getOSAppExtensionIcon(os)}`} target="_blank">
              Download Range Assistant for {getOSIcon(os)} {os}
            </Button>
          )}
          <Button
            onClick={() => setVisible(true)}
            disabled={!isExportable}
            type="primary"
          >
            Export Range <ExportOutlined />
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
              description="Use this web app to construct a new range then export it to use with the Hold'em Poker Tools Range Assistant desktop app. If on desktop, you can download the Range Assistant desktop app using the button above."
            />
          )}
          <div className="gutter" />
          <RangeBuilder
            onChange={(data) => {
              setCombos(data.range);
              setActions(data.actions);
            }}
          />
        </div>
      </Content>
      <Modal
        title="Export Range"
        visible={visible}
        okText="Export"
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
