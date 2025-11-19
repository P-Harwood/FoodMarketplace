import { TextInput, View, Text, TouchableOpacity,   Dimensions,SafeAreaView, ScrollView } from "react-native";
import React, {useState, useEffect} from 'react';
import styles from "../../../resources/styles/stylesAddListing";

import { MMKV } from 'react-native-mmkv'
import { useHeaderHeight } from '@react-navigation/elements';
export default function Register(props){

  const {controlEmail, setCurrentScreen, socket} = props;

    console.log("register")
    console.log("register")
    console.log("register")

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [hallValue, setHallValue] = useState("")

    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [matchingHalls, setMatchingHalls] = useState([])

    const [selectedHall, setSelectedHall] = useState(null)

    const [hallCorrect, setHallCorrect] = useState(false)

    const halls = [
      "Rees Hall",
      "Catherine House",
      "Greetham Street",
      "Margaret Rule",
      "Harry Law",
      "Bateson Hall",
      "Rosalind Franklin",
      "Trafalgar",
      "Burrell House",
      "Chaucer House"
    ]


  useEffect(() => {
    const storage = new MMKV();
    storage.clearAll();


  },[]);

  const showMatchingHalls = () => {
      return(
        <View style={{ flex: 1 }}>
          <ScrollView vertical showsHorizontalScrollIndicator={false}>

            {matchingHalls.map((hall) => (
              <TouchableOpacity
                key={hall}  // Assuming 'hall' should be used as the key
                style={styles.chatBoxOptions}
                onPress={() => selectHall(hall)}
              >
                <View style={{backgroundColor: '#c3c3c3', paddingVertical:5,paddingHorizontal:10, borderRadius: 10}}>
                    <Text style={[styles.boxTextContent, {flex:4, textAlign:"center", color:"white", margin:"1%"}]}>{hall}</Text>
                </View>
              </TouchableOpacity>
            ))}

          </ScrollView>
        </View>
      )

  }




  const register = () => {
      console.log("sending Register")
    console.log("Details:",firstName, lastName, selectedHall, controlEmail)
    if (firstName.length !== 0 && lastName.length !== 0 && hallCorrect){
      console.log("Details:",firstName, lastName, selectedHall, controlEmail)
        socket.emit("Create User", firstName, lastName, selectedHall, controlEmail)
      }
  }


const selectHall = (hall) => {
      setSelectedHall(hall);
      setMatchingHalls([]);
      setHallValue(hall)
      setHallCorrect(true)
}

  const search = (input) => {
    setHallCorrect(false)
    if (input) {
      //if an input is detected then only users whose name starts with the same as the input is returned
      const filteredHalls = halls.filter((hall) => hall.toLowerCase().startsWith(input.toLowerCase()));
      setMatchingHalls(filteredHalls);

    } else {
      //if there is no input then return the whole array
      setMatchingHalls([]);
    }
    //updates the search chat value
    setHallValue(input)
  };



    return(
      <SafeAreaView style = {{height:"100%", width:"100%", justifyContent: 'center', backgroundColor:"#f6f6f6", alignSelf:"center", paddingHorizontal:"15%"}}>

        <View style = {{flex:1, alignItems: 'center', marginVertical:"10%"}}>
          <Text style = {styles.title}>Create an account</Text>

        </View>


        <View style = {{flex:8}}>
          <View style = {{flex:1, alignItems: 'center', width:"100%"}}>
            <TextInput
              value={firstName}
              placeholder="First Name"
              placeholderTextColor="black"
              onChangeText={(value) => {
                setFirstName(value);
                console.log(value);
              }}
              style={[styles.textInput, {width:"100%", paddingLeft:"5%"}]}
            />

            <TextInput
              value ={lastName}
              placeholder="Last Name"
              placeholderTextColor={"black"}
              onChangeText={(value) => {
                setLastName(value);
                console.log(value);
              }}
              style={[styles.textInput, {width:"100%", paddingLeft:"5%"}]}
            />



              <TextInput
                value={hallValue}
                placeholder="Search For accomodation"
                placeholderTextColor={"black"}
                onChangeText={(text) => search(text, setMatchingHalls)}
                style={[styles.textInput, {width:"100%", paddingLeft:"5%"}]}
              />
            {matchingHalls.length > 0 && showMatchingHalls()}
          </View>

        </View>





        <View style = {{flex:1, alignItems: "center"}}>
          <TouchableOpacity
            style = {{backgroundColor: '#c3c3c3', paddingVertical:5,paddingHorizontal:10, borderRadius: 10}}
            onPress={() => register()}
          >
            <Text style = {{fontSize:20, color:"white"}}>Register</Text>
          </TouchableOpacity>
        </View>
        <View style = {{flex:1}}/>

      </SafeAreaView>


    )


  }


