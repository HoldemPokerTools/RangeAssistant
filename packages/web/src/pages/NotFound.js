import React from "react";
import { Button, Result } from "antd";
import { Link } from 'react-router-dom'

export const NotFound = ({ location }) => {
  return (
    <Result
      status="404"
      title={location?.state?.title || "Page Not Found"}
      subTitle={location?.state?.message || "Sorry but the page you're looking for doesn't exist!"}
      extra={[
        <Link to="/"><Button>Return Home</Button></Link>
      ]}
    />
  )
}

export default NotFound;
