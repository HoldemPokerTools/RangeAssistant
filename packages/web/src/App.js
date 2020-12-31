import React, { useState, useRef } from "react";
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
  Carousel,
  Modal,
  Alert
} from "antd";
import { AppleFilled, WindowsFilled, PlusCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { UAParser } from "ua-parser-js";
import BuildRange from "./pages/BuildRange";
import NotFound from "./pages/NotFound";
import ViewRanges from "./pages/ViewRanges";
import overview from "./assets/overview.jpg";
import importImg from "./assets/import.jpg";
import weightsImg from "./assets/weights.jpg";
import frequency from "./assets/frequency.jpg";
import download from "./assets/download.jpg";
import "./App.css";
const { Title, Paragraph, Text } = Typography;

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
  const [introVisible, setIntroVisible] = useState(!localStorage.getItem("showIntro"));

  const handleIntroClose = () => {
    setIntroVisible(false);
    localStorage.setItem("showIntro", 1)
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Router>
        <SiteHeader onOpenHelp={() => setIntroVisible(true)}/>
        <Content className="content">
          <div className="site-layout-content gutter">
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
            <Intro visible={introVisible} onClose={handleIntroClose}/>
          </div>
        </Content>
        <SiteFooter/>
      </Router>
    </Layout>
  );
}

const Intro = ({ visible, onClose }) => {
  const carousel = useRef();

  const NextButton = () => <Button onClick={() => carousel.current?.next()}>Next</Button>;
  const PreviousButton = () => <Button onClick={() => carousel.current?.prev()}>Prev</Button>;
  const DoneButton = () => <Button type="primary" onClick={onClose}>Let's Go</Button>;
  const CarouselControls = ({ showPrev=true, showNext=true, showDone=false }) => (
    <Space style={{display: "flex", justifyContent: "center"}}>
      {showPrev && <PreviousButton/>}
      {showNext && <NextButton/>}
      {showDone && <DoneButton/>}
    </Space>
  )
  const CarouselImage = ({src, alt, width="100%"}) => <img src={src} width={width} style={{margin: "auto", marginBottom: 15, display: "block"}} alt={alt} />;

  return (
    <Modal
      onCancel={onClose}
      afterClose={onClose}
      visible={visible}
      footer={null}
    >
      <Carousel dotPosition="top" dots={{className: "carousel-dots"}} ref={carousel}>
        <div className="intro-slide">
          <Title level={3}>Welcome to the Range Assistant</Title>
          <CarouselImage src={overview} alt="homepage overview"/>
          <Paragraph>
            Use this web app to construct and view balanced Texas Hold'em preflop ranges. You can download your ranges
            to share with others, transfer them to other devices or browsers, or for use with the Hold'em Poker Tools
            Range Assistant desktop app.
          </Paragraph>
          <CarouselControls showPrev={false} showNext={true} showDone={false}/>
        </div>
        <div className="intro-slide">
          <Title level={3}>Import or Create New Ranges</Title>
          <CarouselImage src={importImg} alt="frequency mode"/>
          <Paragraph>
            Use the <PlusCircleOutlined/> Add Range button to get started adding new ranges to your database.
            You can then import a range by dragging and dropping a previously exported <Text code> .range</Text> file or
            create a new range using from a template. You can also duplicate existing ranges using the <CopyOutlined/> button.
          </Paragraph>
          <CarouselControls showPrev={true} showNext={true} showDone={false}/>
        </div>
        <div className="intro-slide">
          <Title level={3}>Assign Combo Weights</Title>
          <CarouselImage src={weightsImg} alt="frequency mode"/>
          <Paragraph>
            Build balanced ranges by mixing your preflop actions for certain combos. For example, if you wish to mix between
            calling and 3 betting A5s, you simply click A5s in the combo matrix to select it and assign each action
            (call and 3 Bet) an even weight of 1 and the range viewer will display the action weights in the hand matrix.
          </Paragraph>
          <CarouselControls showPrev={true} showNext={true} showDone={false}/>
        </div>
        <div className="intro-slide">
          <Title level={3}>Frequency Mode</Title>
          <CarouselImage src={frequency} alt="frequency mode"/>
          <Paragraph>
            When viewing your ranges from the <Text strong>My Ranges</Text> page, a "sample" of your range will be
            displayed by default i.e. if a given combo is 50/50 weighted between fold and open, the app uses an RNG
            to determine which action to take. The RNG is automatically refreshed periodically. However if you wish
            to view the frequencies to make the decision yourself, you can simply toggle on frequency mode.
          </Paragraph>
          <CarouselControls showPrev={true} showNext={true} showDone={false}/>
        </div>
        <div className="intro-slide">
          <Title level={3}>Download and Share Your Ranges</Title>
          <CarouselImage src={download} alt="frequency mode"/>
          <Paragraph>
            <Alert className="gutter" type="warning" message={
              <Text>
                <Text strong> IMPORTANT: </Text>Your ranges are stored locally in your browser and will
                <Text strong> not </Text> be accessible across devices/different browsers. You should download your
                ranges to back them up and import them on different devices.</Text>
            }/>
          </Paragraph>
          <CarouselControls showPrev={true} showNext={false} showDone={true}/>
        </div>
      </Carousel>
    </Modal>
  )

}

const SiteHeader = ({ onOpenHelp }) => (
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
    <Button onClick={onOpenHelp} type="link">How to Use</Button>
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
    </Space>
  </Footer>
)

export default App;
