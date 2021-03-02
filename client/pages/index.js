import axios from "axios";
import buildClient from "../api/build-client";
const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1> Youre signed in</h1>
  ) : (
    <h1>you are not signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  //   const response = await axios.get("/api/users/currentuser");
  //   return response.data;
  const client = buildClient(context);
  const { data } = await client.get("/api/users/currentUser");
  return data;
};

export default LandingPage;
