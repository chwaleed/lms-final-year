// src/components/GlobalMessageProvider.jsx
import { message } from "antd";
import { setGlobalMessageApi } from "../utils/globalMessage";

const GlobalMessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  setGlobalMessageApi(messageApi);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export default GlobalMessageProvider;
