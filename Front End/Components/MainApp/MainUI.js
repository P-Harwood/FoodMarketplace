import { TextInput, View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Image } from "react-native";
import stylesImages from "../../resources/styles/stylesImages";


const MainUI = (props) => {
  const { setCurrentPage, userDetails, socket } = props;


  const [hallName, setHallName] = useState(null);
  const [reservationCount, setReservationCount] = useState(null);













  useEffect(() => {

    const retrieveHallName = (hallName) => {
      console.log(hallName)
      setHallName(hallName)
    }
    const retrieveReservationCount = (reservationCount) => {
      console.log(reservationCount)
      setReservationCount(reservationCount)
    }


    socket.emit("getAccommodationName", userDetails.halls_ID);
    socket.emit("ReservationCount", userDetails.user_ID);

    socket.on("returnHallName", retrieveHallName)
    socket.on("ReservationCount", retrieveReservationCount)

    return () => {
      socket.off("returnHallName", retrieveHallName);
      socket.off("ReservationCount", retrieveReservationCount);
    };

  }, []);







  return (
    <View style={ {flex:1, backgroundColor:"#c3c3c3", width:"100%"}}>


      <View style={{flex:1}}>
        <Text style = {[styles.optionText,{alignSelf:"center", fontSize: 30}]}>Fresher</Text>
      </View>


      <View style={{flex:2, backgroundColor:"#d6e6cf", width: "100%"}}>
        <ScrollView horizontal={true} style = {{flexDirection:"row", width: "100%"}}>
          <TouchableOpacity
            key={"Buy"}
            style={stylesImages.imageBox}
            onPress={() => (setCurrentPage("HomeScreen"))}
          >

            <Image
              key={"BuyImage"}
              style={{ height: "80%", aspectRatio: 1/1 }}
              source={require('../../assets/orderImage.png')}
            />
              <Text style = {{alignSelf:"center"}}>Buy meals</Text>


          </TouchableOpacity>

          <TouchableOpacity
            key={"Sell"}
            style={stylesImages.imageBox}
            onPress={null}
          >

            <Image
              key={"SellImage"}
              style={{ height: "80%", aspectRatio: 1/1 }}
              source={require('../../assets/sellIcon.png')}
            />
              <Text style = {{alignSelf:"center"}}>Sell meals</Text>

          </TouchableOpacity>

          <TouchableOpacity
            key={"Messages"}
            style={stylesImages.imageBox}
            onPress={null}
          >
            <Image
              key={"MessagesImage"}
              style={{ height: "80%", aspectRatio: 1/1 }}
              source={require('../../assets/MessageIcon.png')}
            />
            <Text style = {{alignSelf:"center"}}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            key={"Profile"}
            style={stylesImages.imageBox}
            onPress={null}
          >
            <Image
              key={"ProfileImage"}
              style={{ height: "80%", aspectRatio: 1/1 }}
              source={require('../../assets/ProfileIcon.png')}
            />
            <Text style = {{alignSelf:"center"}}>Profile</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      <TouchableOpacity style={[styles.optionBox, { flex: 1, padding: "5%" }]} onPress={() => (setCurrentPage("Profile"))}>
        <View style={{flex:1}}/>
        <View style = {{flexDirection:"row"}}>
          <View style = {{flexDirection:"column"}}>
            <View style = {styles.circle}></View>

          </View>
          <View>
            <Text style = {styles.optionText}>{userDetails.user_F_Name} {userDetails.user_L_Name}</Text>
            <Text style = {[styles.optionText, {color: "grey", fontSize: 15}]}>{hallName}</Text>

          </View>
        </View>
        <View style={{flex:1}}/>
      </TouchableOpacity>


      <View style={{flex:1}}/>

      <View style={{flex:3}}>
        <View style={{flexDirection:"row", flex:1}}>

          <TouchableOpacity style={[styles.optionBox, { flex: 1, margin:"0%", padding:"0%"}]} onPress={() => (setCurrentPage("Browse Meals"))}>
              <View style = {{flex:1}}/>
              <Text style = {[styles.optionText,{alignSelf:"center", flex:1}]}>Browse Meals</Text>
              <View style = {{flex:1}}/>
          </TouchableOpacity>



          <TouchableOpacity style={[styles.optionBox, { flex: 1, marginLeft:"0%", padding:"0%"}]} onPress={() => (setCurrentPage("ViewReservations"))}>
            <View style = {{flex:1}}/>
            <Text style = {[styles.optionText,{alignSelf:"center"}]}>Upcoming</Text>
            <Text style = {[styles.optionText,{alignSelf:"center"}]}>Reservations</Text>
            <View style = {{flex:1}}/>
            <Text style = {[styles.optionText,{alignSelf:"center"}]}>{reservationCount}</Text>
            <View style = {{flex:1}}/>
          </TouchableOpacity>
        </View>
      </View>



      <View style={{flex:3}}>
        <View style={{flexDirection:"row", flex:1}}>



          <TouchableOpacity style={[styles.optionBox, { flex: 1, margin:"0%", padding:"0%"}]} onPress={() => (setCurrentPage("Messages"))}>
            <View style = {{flex:1}}/>
            <Text style = {[styles.optionText,{alignSelf:"center"}]}>Messages</Text>
            <View style = {{flex:1}}/>
          </TouchableOpacity>


          <TouchableOpacity style={[styles.optionBox, { flex: 1, marginLeft:"0%", padding:"0%"}]} onPress={() => (setCurrentPage("Sell Meals"))}>
            <View style = {{flex:1}}/>
            <Text style = {[styles.optionText,{alignSelf:"center", flex:1}]}>Sell Meals</Text>
            <View style = {{flex:1}}/>
          </TouchableOpacity>




        </View>
      </View>


      <View style = {{flex:2}}/>
    </View>

  )
}

export default MainUI;


const styles = StyleSheet.create({
  optionBox: {flex:1, borderColor:"#d2d2d2", borderRadius:20, borderWidth:1, padding:"10%",
    backgroundColor:"#d3d3d3",
    marginTop: "2%",
    marginRight: "5%",
    marginBottom: "2%",
    marginLeft: "5%"},

  optionText:{color:"black", justifyContent:"center", fontSize:20},

  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E4E4E4',
    marginRight:"5%",
    alignSelf:"flex-start",
    marginTop:"1%",
    marginBottom:"5%"
  }
});
