
import { TextInput, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React, {useState} from 'react';

import AddListing from "./AddListing.js"
import UserListings from "./UserListings.js"
import EditListings from "./EditListing";


export default function addListingControl(props){

  const {userDetails,socket} = props;

  const [currentScreen, setCurrentScreen] = useState("AddListings")

 const [listingDetails, setListingDetails] = useState(null)

  return(
    <View style = {{flex:1, width:"100%"}}>
      {(currentScreen === "AddListing") && <AddListing userDetails = {userDetails} setCurrentScreen = {setCurrentScreen} socket = {socket} />}
      {(currentScreen === "AddListings") && <UserListings userDetails = {userDetails} setListingDetails = {setListingDetails} setCurrentScreen = {setCurrentScreen} socket = {socket}/>}
      {(currentScreen === "EditListing") && <EditListings userDetails = {userDetails} listingDetails = {listingDetails} setListingDetails = {setListingDetails} setCurrentScreen = {setCurrentScreen} socket = {socket}/>}
    </View>
  )
}
