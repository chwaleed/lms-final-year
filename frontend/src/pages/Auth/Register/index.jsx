import React from "react";
import RegistrationForm from "../../../generalComponents/RegistrationForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    try {
      const response = await axios.post("/api/register", e);
      if (response.status === 201) {
        window.message.success("Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      if (error.status === 409) {
        window.message.error(
          "User with this email or username already exists."
        );
      } else {
        window.message.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex fonlex-col justify-center items-center px-4 sm:px-6 sm:py-4 lg:px-8">
      <RegistrationForm onSubmit={onSubmit} />
    </div>
  );
}

export default Register;
