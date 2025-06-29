import axios from "axios";
import toast from "react-hot-toast";

const errorHandle = (error) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error;

    if (axiosError.response) {
      const errorResponse = axiosError.response.data;

      if (axiosError.response.status === 403) {
        console.log("came in error handle");
        toast.error("You have been blocked by the admin.");
        window.location.href = "/user/blocked";
      } else if (axiosError.response.status === 400) {
        toast.error(errorResponse.message);
      } else if (errorResponse.message) {
        toast.error(errorResponse.message);
      } else {
        console.log("Error response has no more message");
        toast.error("An error occurred. Please try again");
      }
    } else {
      console.log(axiosError.message, "-------------error from");
      toast.error("An error occurred. Please try again");
      console.log("axiosError", axiosError.message);
    }
  } else {
    toast.error("An error occurred. Please try again!");
    console.log("Error", error.message);
  }
};

export default errorHandle;
