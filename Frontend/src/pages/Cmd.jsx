import React from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { useHistory } from "react-router-dom";
import socketio from "socket.io-client";
import { SOCKET_URL } from "../config";

const Cmd = () => {
  const history = useHistory();

  React.useEffect(() => {
    // init
    const socket = socketio.connect(SOCKET_URL, { transports: ["websocket"] });
    const term = new Terminal();

    // config
    term.open(termDOM.current);
    term.resize(90, 25);
    socket.emit("resize", 90, 25);
    term.focus();

    // input
    term.onData((data) => {
      socket.emit("in", data);
    });

    // output
    socket.on("out", (data) => {
      term.write(data);
    });

    // exit
    socket.on("exit", () => {
      term.dispose();
      socket.emit("kill");
      history.push("/vmslist");
    });

    // focus
    window.addEventListener("focus", () => {
      term.focus();
    });

    return () => {
      // close terminal
      term.dispose();
      socket.emit("kill");
      window.removeEventListener("focus", window);
    };
  }, []);

  const termDOM = React.useRef(null);

  return (
    <>
      <h2 style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
        interact with your vms
      </h2>
        <div ref={termDOM} className="terminal"></div>
    </>
  );
};

export default Cmd;
