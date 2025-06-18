let messageApi = null;

export const setGlobalMessageApi = (api) => {
  messageApi = api;

  // Optional: attach to window for global use
  window.message = {
    success: (content, options = {}) =>
      api.open({ type: "success", content, ...options }),
    error: (content, options = {}) =>
      api.open({ type: "error", content, ...options }),
    warning: (content, options = {}) =>
      api.open({ type: "warning", content, ...options }),
    info: (content, options = {}) =>
      api.open({ type: "info", content, ...options }),
  };
};

export const getMessageApi = () => messageApi;
