import axios from "axios";

const logout = async () => {
  try {
    console.log("Attempting to log out...");
    const response = await axios.post("/api/logout");

    if (response?.data && response.data.statusCode === 200) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

export { logout };
