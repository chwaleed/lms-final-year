import React from "react";
import LoginForm from "../../../generalComponents/LoginForm";
import axios from "axios";
import { useNavigate } from "react-router";
import { userInfoStore } from "../../../context/store";

function Login() {
  const nevigate = useNavigate();
  const { setUser } = userInfoStore();
  const onSubmit = async (e) => {
    try {
      const response = await axios.post("/api/login", e);
      console.log(response);
      if (response.status === 200) {
        window.message.success("Login successful!");
        console.log(response.data.data.user);
        setUser(response.data.data.user);

        if (response.data.data.user.role === "instructor") {
          nevigate("/instructor/dashboard");
        } else {
          nevigate("/student/dashboard");
        }
      }
    } catch (error) {
      console.log(error);
      if (error.status === 401) {
        window.message.error("Invalid email or password.");
      } else {
        window.message.error("Login failed. Please try again.");
      }
    }
  };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 sm:py-4 lg:px-8">
      <LoginForm onSubmit={onSubmit} />
    </div>
  );
}

export default Login;
