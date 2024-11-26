import axios from "axios";

const url = `http://192.168.160.190:7000/api/v1/auth/hosts`;


const GetHosts = async () => {

  try {
    const response = await axios.get(url);

    if (response.data) {
      return response.data;
    }

    return null;

  } catch (error) {
    console.error('Error authenticating user:', error.message);
    return null;
  }
};

export default GetHosts;