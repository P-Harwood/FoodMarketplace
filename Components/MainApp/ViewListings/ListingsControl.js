import { TextInput, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React, {useState} from 'react';



import ViewListings from "./ViewListings.js"

import AddListing from "../AddListings/AddListing";

const ListingsControl = (props) => {

  const {userDetails, socket} = props;





  return(
    <View style = {{flex:1, width:"100%", backgroundColor: "#EFFFE8"}}>
      <ViewListings  userDetails = {userDetails} socket = {socket} />
    </View>
  )
}

export default ListingsControl
