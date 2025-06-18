import React from "react";
import { Modal } from "antd";

function Model({ isModalOpen, handleOk, handleCancel, children }) {
  return (
    <Modal
      closable={{ "aria-label": "Custom Close Button" }}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
    >
      {children}
    </Modal>
  );
}

export default Model;
