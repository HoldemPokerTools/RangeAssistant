import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {
  Layout,
  Space,
  Button,
  Typography,
  Alert,
} from "antd";
import { GithubOutlined, AppleFilled, WindowsFilled } from "@ant-design/icons";
import { UAParser } from "ua-parser-js";
import BuildRange from "./pages/BuildRange";
import NotFound from "./pages/NotFound";
import ViewRanges from "./pages/ViewRanges";
import "./App.css";
const { Text } = Typography;

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

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Router>
        <SiteHeader/>
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
              <Switch>
                <Route exact path="/">
                  <ViewRanges/>
                </Route>
                <Route exact path="/range/:rangeId">
                  <BuildRange />
                </Route>
                <Route path="*">
                  <NotFound />
                </Route>
              </Switch>
            <div className="gutter" />
          </div>
        </Content>
        <SiteFooter/>
      </Router>
    </Layout>
  );
}

const SiteHeader = () => (
  <Header className="site-layout-header">
    <img
      alt="logo"
      height="60"
      src="./logo512.png"
    />
    <Link to="/" className="logo-text">
      <span style={{ color: "#000"}}>Hold'em Poker Tools</span>
      <br/>
      <span style={{ color: "#bd2829"}}>Range Assistant</span>
    </Link>
    <div className="spacer"/>
    <Link to="/" className="ant-btn-link">My Ranges</Link>
  </Header>
)

const SiteFooter = () => (
  <Footer style={{ textAlign: "center" }}>
    <Text>Hold'em Poker Tools: Range Assistant ©2020</Text>
    <br />
    <Text>
      Hold'em Poker Tools projects are free for everyone to use. Show your support on Buy Me
      a Coffee!
    </Text>
    <br />
    <Space>
      <a href="https://www.buymeacoffee.com/holdemtools" target="_blank" rel="noreferrer">
        <img
          src="https://cdn.buymeacoffee.com/buttons/default-red.png"
          alt="Buy Me A Coffee"
          style={{ height: 41, width: 174, borderRadius: 5 }}
        />
      </a>
      {os && (
        <Button href={`https://github.com/HoldemPokerTools/RangeAssistant/releases/latest/download/Range-Assistant.${getOSAppExtensionIcon(os)}`} target="_blank">
          Download Range Assistant for {getOSIcon(os)} {os}
        </Button>
      )}
      <a
        href="https://github.com/HoldemTools/RangeAssistant"
        target="_blank"
        rel="noreferrer"
      >
        <GithubOutlined /> View on GitHub
      </a>
    </Space>
  </Footer>
)

export default App;
