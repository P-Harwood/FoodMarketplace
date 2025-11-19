import {View, KeyboardAvoidingView, Modal, TouchableOpacity, Text} from 'react-native';
import {useState, useEffect} from 'react';


import Profile from "./Profile/Profile";
import AddListingControl from "./AddListings/AddListingControl.js"
import LoginControl from "./SignIn/LoginControl";

import TopBar from "./TopBar/TopBar.js"
import styles from '../../resources/styles/styles.js';
import ListingsControl from "./ViewListings/ListingsControl";

import MainUI from "./MainUI";
import ReservationsControl from "./Reservations/ReservationsControl";


import MessageControl from "./Messages/MessageControl";
import HomeScreen from "./testtFiles/HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function MainPage(props) {

  const {socket} = props;
  //gets the props passed to it from app.js

  const [currentPage, setCurrentPage] = useState('LoginControl')
  const [menuVisible, setMenuVisible] = useState(false)
  const [userDetails, setUserDetails] = useState(null)


  const [currentHomeScreenPage, setCurrentHomeScreenPage] = useState('Buy')

  const sideBarOptions = [
    { name: "Buy", action: () => setCurrentPage("Browse Meals") },
    { name: "Sell", action: () => setCurrentPage("Sell Meals") },
    { name: "Reservations", action: () => setCurrentPage("ViewReservations") },
    { name: "Messenger", action: () => setCurrentPage("Messages") },

  ];


  const changeMenuVisibility = () => {
    setMenuVisible(!menuVisible)
  }

  useEffect(() => {
    if (userDetails){
      console.log("homeScreen set")
      setCurrentPage("HomeScreen")
    } else {
      console.log("LoginControl Screen")
      setCurrentPage("LoginControl")
    }
    console.log("userDetails", userDetails)
  }, [userDetails]);

  useEffect(() => {
    socket.emit("message", "hi");
  }, []);


  //used for controlling what page is currently visible


  return (
    <GestureHandlerRootView style={styles.appContainer}>

      <View style={
        {flex: 12 ,
          alignItems: 'center',
          justifyContent: "center",
          width: "100%"}}>
        {/* displays current page */}
        {(currentPage === "HomeScreen") && <HomeScreen userDetails = {userDetails} socket = {socket} />}
        {(currentPage === "MainUI") && <MainUI setCurrentPage = {setCurrentPage} userDetails = {userDetails} socket = {socket}/>}
        {(currentPage === "Profile") && <Profile setCurrentPage = {setCurrentPage} userDetails = {userDetails} socket = {socket}/>}
        {(currentPage === "LoginControl") && <LoginControl setUserDetails = {setUserDetails} socket = {socket}/>}
        {(currentPage === "Sell Meals") && <AddListingControl userDetails = {userDetails} socket = {socket}/>}
        {(currentPage === "Browse Meals") && <ListingsControl userDetails = {userDetails} setCurrentPage = {setCurrentPage} socket = {socket}/>}
        {(currentPage === "Messages") && <MessageControl userDetails = {userDetails} socket = {socket}/>}
        {(currentPage === "ViewReservations") && <ReservationsControl userDetails = {userDetails} setCurrentPage = {setCurrentPage} socket = {socket}/>}


      </View>
      {/*{(currentPage !== "LoginControl" && currentPage !== "MainUI") && <BottomBar screenUpdate = {setCurrentPage}/>}*/}




    </GestureHandlerRootView>


  );
}
