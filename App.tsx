// App.js

import MainPage from './Components/MainApp/MainPage';
import initializeSocket from "./Components/SocketConnection";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

function App() {
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState(null);
  const [connection, setConnection] = useState(false);


  useEffect(() => {
    const newSocket = initializeSocket(setConnection);

    setSocket(newSocket);

  }, []);


  useEffect(() => {
    if (connection && socket){
      console.log("connection", socket, connection)
      setScreen("MainPage")
    }
  }, [connection, socket]);


  return (
    <View style={{ flex: 1 }}>
      {screen === "MainPage" && <MainPage socket={socket} />}
    </View>
  );
}

export default App;
