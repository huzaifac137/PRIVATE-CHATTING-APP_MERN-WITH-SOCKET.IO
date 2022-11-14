import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, redirect, Route, Routes } from "react-router-dom";
import Login from "./AUTH/Login";
import Signup from "./AUTH/Signup";
import Home from "./Home";
import authContext from "./CONTEXT/AuthContext";
import Navbar from "./COMPONENTS/Navbar";
import { io } from "socket.io-client";
import Chat from "./Chat";
import useRefreshTokenHook from "./CUSTOM-HOOKS/useRefreshToken";

function App(props) {
  const { refreshToken } = useRefreshTokenHook();

  const [EMAIL, setEmail] = useState();
  const [USERNAME, setUsername] = useState();
  const [TOKEN, setToken] = useState(null);
  const [USERID, setUserId] = useState();

  useEffect(() => {
    refreshToken(setLogin, setUserId, setUsername, setEmail, setToken);
  }, []);

  const setLogin = useCallback(
    (username, email, userId, token, expirationTime) => {
      const tokenTime =
        expirationTime || new Date(new Date().getTime() + 1000 * 60 * 30);
      localStorage.setItem(
        "LoggedInUser",
        JSON.stringify({
          username,
          email,
          userId,
          token,
          expirationTime: tokenTime.toISOString(),
        }),
      );

      setEmail(email);
      setToken(token);
      setUserId(userId);
      setUsername(username);
    },
  );

  return (
    <authContext.Provider
      value={{
        username: USERNAME,
        email: EMAIL,
        token: TOKEN,
        userId: USERID,
        setUsername: setUsername,
        setEmail: setEmail,
        setToken: setToken,
        setUserId: setUserId,
        setLogin: setLogin,
      }}
    >
      <BrowserRouter>
        <Routes>
          {TOKEN ? (
            <Route path="/" element={<Home />} />
          ) : (
            <Route path="/" element={<Login />} />
          )}
          {!TOKEN && <Route path="/login" element={<Login />} />}
          {!TOKEN && <Route path="/signup" element={<Signup />} />}
        </Routes>
      </BrowserRouter>
    </authContext.Provider>
  );
}

export default App;
