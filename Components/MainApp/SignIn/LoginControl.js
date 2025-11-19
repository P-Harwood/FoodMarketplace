import { useState } from "react";
import {View} from "react-native";

import GoogleSignIn from "./GoogleSignIn";
import Register from "./Register";



const LoginControl = (props) => {

  const { setUserDetails, socket } = props

  const [currentPage,setCurrentPage] = useState("GoogleSignIn")

  const [controlEmail, setControlEmail] = useState("")



  console.log("LoginControl internals")
  socket.on("Login", (userDetails) => {setUserDetails(userDetails)})
  const register = (firstName, lastName, selectedHall) => {
    socket.emit("Create User", firstName, lastName, selectedHall, controlEmail)
  }

  return(
    <View style = {{width:"100%",height:"100%"}}>
     {(currentPage === "GoogleSignIn") && <GoogleSignIn setControlEmail = {setControlEmail} setCurrentPage = {setCurrentPage} socket = {socket}/>}
      {(currentPage === "Register") && <Register controlEmail = {controlEmail} setCurrentPage = {setCurrentPage} socket = {socket}/>}
    </View>
  )

}
export default LoginControl;
