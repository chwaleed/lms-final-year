import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useFetch = (url, optionsOrDependencies = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef();

  // Handle both options object and dependencies array
  let options = {};
  let dependencies = [];

  if (Array.isArray(optionsOrDependencies)) {
    // If second parameter is an array, treat it as dependencies
    dependencies = optionsOrDependencies;
  } else {
    // If second parameter is an object, treat it as options
    options = optionsOrDependencies;
    dependencies = options.dependencies || [];
  }

  const {
    method = "GET",
    headers = {},
    body = null,
    skip = false,
    ...axiosOptions
  } = options;

  useEffect(() => {
    if (skip || !url) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cancel previous request if it exists
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Request canceled due to new request");
        }

        // Create new cancel token
        cancelTokenRef.current = axios.CancelToken.source();

        const config = {
          url,
          method,
          headers,
          data: body,
          cancelToken: cancelTokenRef.current.token,
          ...axiosOptions,
        };

        const response = await axios(config);
        setData(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data || err.message || "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
    };
  }, [url, method, skip, ...dependencies]);

  const refetch = () => {
    if (url && !skip) {
      setLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          if (cancelTokenRef.current) {
            cancelTokenRef.current.cancel("Refetch requested");
          }

          cancelTokenRef.current = axios.CancelToken.source();

          const config = {
            url,
            method,
            headers,
            data: body,
            cancelToken: cancelTokenRef.current.token,
            ...axiosOptions,
          };

          const response = await axios(config);
          setData(response.data);
        } catch (err) {
          if (!axios.isCancel(err)) {
            setError(err.response?.data || err.message || "An error occurred");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  };

  return { data, loading, error, refetch };
};

export default useFetch;
