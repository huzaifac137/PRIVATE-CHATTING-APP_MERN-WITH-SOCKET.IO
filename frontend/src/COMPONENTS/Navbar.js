import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authContext from "../CONTEXT/AuthContext";
import ExampleModal from "./Modal";

function Navbar({ socket }) {
  const ctx = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    socket.current.emit("logout", ctx.userId);
    localStorage.removeItem("LoggedInUser");
    ctx.setUsername(null);
    ctx.setEmail(null);
    ctx.setUserId(null);
    ctx.setToken(null);

    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        margin: "10px auto",
      }}
      className="navbar"
    >
      <div className="navlinks">
        {ctx.token && (
          <NavLink to="/" end style={{ marginRight: "50px" }}>
            {" "}
            HOME
          </NavLink>
        )}
      </div>

      {ctx.token && <ExampleModal confirmLogout={handleLogout} />}
    </div>
  );
}

export default Navbar;
