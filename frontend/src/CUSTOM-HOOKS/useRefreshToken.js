import React, { useContext, useState } from "react";
import authContext from "../CONTEXT/AuthContext";

const useRefreshTokenHook = () => {
  let changedToken = "";
  const ctx = useContext(authContext);

  const [ERRORR, setError] = useState(null);

  const refreshToken = async (
    setLogin,
    setUserId,
    setUsername,
    setEmail,
    setToken,
    getChatCallback,
    sendMessage,
  ) => {
    const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
    if (loggedInUser) {
      const tokenExpirationTime = new Date(loggedInUser.expirationTime);
      if (tokenExpirationTime > new Date()) {
        setLogin(
          loggedInUser.username,
          loggedInUser.email,
          loggedInUser.userId,
          loggedInUser.token,
          tokenExpirationTime,
        );
        changedToken = loggedInUser.token;
      } else {
        let responseData;
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            },
          );

          responseData = await response.json();

          if (response.status === 401) {
            localStorage.removeItem("LoggedInUser");
            setEmail(null);
            setToken(null);
            setUserId(null);
            setUsername(null);
            throw new Error(responseData.message);
          }

          if (response.status !== 201) {
            throw new Error(responseData.message);
          }

          changedToken = responseData.token;
          setLogin(
            responseData.username,
            responseData.email,
            responseData.userId,
            responseData.token,
            new Date(new Date().getTime() + 1000 * 60 * 30),
          );
        } catch (err) {
          setError(err.message);
        }
      }
      if (getChatCallback) {
        getChatCallback(changedToken);
      }

      if (sendMessage) {
        sendMessage(changedToken);
      }
    }
  };

  return { refreshToken, ERRORR };
};

export default useRefreshTokenHook;
