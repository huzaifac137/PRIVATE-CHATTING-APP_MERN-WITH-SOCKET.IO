import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Chat from "./Chat";
import { io } from "socket.io-client";
import authContext from "./CONTEXT/AuthContext";
import Navbar from "./COMPONENTS/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  const navigate = useNavigate();

  const [showChat, setShowChat] = useState(false);
  const [ERROR, setError] = useState(null);
  const [USERS, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, SetIsLoading] = useState();

  const socket = useRef();
  const ctx = useContext(authContext);

  const getUsers = async () => {
    let responseData;
    try {
      SetIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users`,
        {
          headers: {
            Authorization: "mjfcmjbl" + ctx.token,
          },
        },
      );

      responseData = await response.json();

      if (response.status !== 200) {
        throw new Error(responseData.message);
      }

      setUsers(responseData.users);
      SetIsLoading(false);
    } catch (err) {
      setError(err.message);
      SetIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    socket.current = io(`${process.env.REACT_APP_SERVER_URL}`, {
      transports: ["websocket"],
    });
    socket.current.emit("add-user", ctx.userId);

    socket.current.on("online-users", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  useEffect(() => {
    socket.current.on("notification", (data) => {
      toast.success(data.authorName + ` : ${data.message}  `);
    });
  }, []);

  const handleClick = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setShowChat((prev) => !prev);
  };

  return (
    <div className="totalContainer">
      <Navbar socket={socket} />
      {isLoading && <h3>LOADING....</h3>}
      <div className="userContainer">
        {ERROR && <h2> {ERROR} </h2>}
        {USERS.map(
          (item) =>
            item.id !== ctx.userId && (
              <div
                key={item.id}
                className="user"
                onClick={() => handleClick(item.id, item.username)}
              >
                <h3>{item.username}</h3>
                <h4>
                  {" "}
                  {onlineUsers.some((user) => user === item.id)
                    ? "online"
                    : " offline"}{" "}
                </h4>
              </div>
            ),
        )}
      </div>
      {showChat === true && (
        <Chat
          socket={socket}
          selectedUserId={selectedUserId}
          selectedUsername={selectedUsername}
        />
      )}
      <ToastContainer />
    </div>
  );
}

export default Home;
