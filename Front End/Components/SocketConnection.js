import io from "socket.io-client";
import Config from "../resources/Config.js";

let socketInstance = null;

const initializeSocket = (setConnection) => {
  if (!socketInstance) {
    const url = Config("url");
    console.log("Connecting on url:", url);

    // Create the socket instance
    socketInstance = io(url, { reconnectionAttempts: 1, timeout: 200 });

    socketInstance.on("connect_error", (error) => {
      console.log("Connection error:", error);
      // Handle connection error
      setConnection(false); // Update connection state if connection error occurs
    });

    socketInstance.on("connect_timeout", () => {
      console.log("Connection timeout");
      // Handle connection timeout
      setConnection(false); // Update connection state if connection timeout occurs
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      socketInstance.emit("join");
      setConnection(true); // Update connection state on successful connection
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnection(false); // Update connection state on disconnect
    });
  }

  return socketInstance;
};

export default initializeSocket;
