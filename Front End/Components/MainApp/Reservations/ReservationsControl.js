import { TextInput, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React, {useState} from 'react';



import ViewReservations from "./ViewReservations.js"


const ReservationsControl = (props) => {

  const {userDetails, socket} = props;





  return(
    <View style = {{flex:1, width:"100%", backgroundColor: "#EFFFE8"}}>
      <ViewReservations userDetails = {userDetails} socket = {socket} />
    </View>
  )
}

export default ReservationsControl
