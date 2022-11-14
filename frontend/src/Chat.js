import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import ScrollToBottom from "react-scroll-to-bottom";
import authContext from "./CONTEXT/AuthContext";
import useRefreshTokenHook from "./CUSTOM-HOOKS/useRefreshToken";

function Chat({ socket, selectedUsername, selectedUserId, status }) {
  const { refreshToken, ERRORR } = useRefreshTokenHook();
  const ctx = useContext(authContext);

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [ERROR, setError] = useState(ERRORR);
  const [isLoading, setIsLoading] = useState();

  const sendMessage = async (token) => {
    if (currentMessage !== "") {
      const messageData = {
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
        to: selectedUserId,
        from: ctx.userId,
        authorName: ctx.username,
      };

      socket.current.emit("send-msg", messageData);

      setMessageList((list) => {
        return [...list, messageData];
      });

      setCurrentMessage("");

      // SAVE THE MESSAGE TO MONGODB
      let responseData;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/chats/send`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: "mjfcmjbl" + token,
            },

            body: JSON.stringify({
              messageData: messageData,
            }),
          },
        );

        responseData = await response.json();

        if (response.status !== 201) {
          throw new Error(responseData.message);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getChat = async (token) => {
    console.log("chat loaded");
    setIsLoading(true);
    let responseData;
    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/chats?author=${ctx.userId}&to=${selectedUserId}`,
        {
          headers: {
            Authorization: "mjfcmjbl" + token,
          },
        },
      );

      responseData = await response.json();

      if (response.status !== 200) {
        throw new Error(responseData.message);
      }

      setMessageList(responseData.chat);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    socket.current.on("recieve-msg", (data) => {
      setArrivalMessage(data);
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      selectedUserId === arrivalMessage.author &&
      setMessageList((list) => {
        return [...list, arrivalMessage];
      });
  }, [arrivalMessage, selectedUserId]);

  useEffect(() => {
    refreshToken(
      ctx.setLogin,
      ctx.setUserId,
      ctx.setUsername,
      ctx.setEmail,
      ctx.setToken,
      getChat,
    );
  }, []);

  return (
    <div className="chat">
      {isLoading === true && <h3>LOADING....</h3>}
      {ERROR ? (
        <h2> {ERROR} </h2>
      ) : (
        <>
          <div className="chat-header">
            <h3> {selectedUsername} </h3>
          </div>
          <div className="chat-body">
            <ScrollToBottom
              className="scroll"
              initialScrollBehavior="smooth"
              scrollViewClassName="scrollbar"
            >
              {messageList.map((item) => (
                <div
                  id="message"
                  className={ctx.username === item.authorName ? "you" : "other"}
                  key={Math.random() * Math.random() * Math.random()}
                >
                  <div className="message-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h3> {item.message} </h3>
                      <h5 style={{ alignSelf: "flex-end", margin: "5px" }}>
                        {" "}
                        {item.time}{" "}
                      </h5>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollToBottom>
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder="hey , this is message"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button
              type="submit"
              onClick={() =>
                refreshToken(
                  ctx.setLogin,
                  ctx.setUserId,
                  ctx.setUsername,
                  ctx.setEmail,
                  ctx.setToken,
                  null,
                  sendMessage,
                )
              }
            >
              {" "}
              &#9658;{" "}
            </button>
          </div>{" "}
        </>
      )}
    </div>
  );
}

export default Chat;
