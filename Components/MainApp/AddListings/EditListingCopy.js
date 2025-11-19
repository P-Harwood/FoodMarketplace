import { TextInput, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React, {useState} from 'react';
import styles from "../../../resources/styles/stylesAddListing";







export default function EditListings (props) {
  const {userDetails, itemToEdit, clearEditItem, socket} = props;








  const [mealName, setMealName] = useState(itemToEdit.meal_Name);
  const [mealPrice, setMealPrice] = useState(Number(itemToEdit.meal_Price));
  const [mealAvailable, setMealAvailable] = useState(Number(itemToEdit.meal_Available));
  const [mealDescription, setMealDescription] = useState(itemToEdit.meal_Description);
  const [mealQuantity, setMealQuantity] = useState(itemToEdit.meal_Quantity);


  const cancel = () => {
    clearEditItem()
  }


  console.log("EDIT ", itemToEdit)
  const editListing = () => {
    const mealDetailsArray = [mealName, mealPrice, mealAvailable, mealDescription]



    for (let i = 0; i < mealDetailsArray.length; i++) {
      if (mealDetailsArray[i] === null || mealDetailsArray[i] === ""){
        console.log(i, null, "nothing")
      }else{
        console.log(i, mealDetailsArray[i])
      }
    }
    const DetailsFormat = {
      "user_ID":userDetails.user_ID,
      "halls_ID":userDetails.halls_ID,
      "meal_ID": itemToEdit.meal_ID,
      "meal_Name":mealName,
      "meal_Price":mealPrice,
      "meal_Available":mealAvailable,
      "meal_Quantity":mealQuantity,
      "meal_Description":mealDescription

    }
    console.log(DetailsFormat)
    socket.emit("editListing",DetailsFormat);
    cancel()
  }






  return (
    <SafeAreaView style = {{height:"100%", width:"100%", justifyContent: 'center', paddingLeft:"10%", paddingRight:"10%"}}>

      <View style = {{flex:2}}/>
      <View style = {{flex:1, alignItems: 'center'}}>
        <Text style = {styles.title}>Edit listing</Text>

      </View>
      <View style={{flex:1}}/>
      <View style = {{flex:8}}>
        <View style = {{flex:1, alignItems: 'center', width: "100%"}}>
          <TextInput
            value={mealName}
            placeholder="Enter meal title"
            placeholderTextColor="black"
            onChangeText={(value) => {
              setMealName(value);
              console.log(value);
            }}
            style={[styles.textInput, {width:"100%"}]}
          />

          <View style = {{flexDirection:"row", width :"100%"}}>


            <TextInput
              value ={mealPrice.toString()}
              placeholder={"Price"}
              placeholderTextColor={"black"}
              keyboardType="numeric"
              onChangeText={(value) => {
                setMealPrice(parseInt(value,10));
                console.log(value);
              }}
              style={[styles.textInput, { flex: 1 }]}
            />
            <View style = {{flexDirection:"row", flex:1, paddingLeft:"5%"}}>
              <TextInput
                value ={mealAvailable.toString()}
                placeholder={"Quantity"}
                placeholderTextColor={"black"}
                keyboardType="numeric"
                onChangeText={(value) => {
                  setMealAvailable(parseInt(value,10));
                  console.log(value);
                }}
                style={[styles.textInput, { flex: 2 }]}
              />
              <View >
                <Text style ={{ color:"black" }}>{`/${mealQuantity}`}</Text>
              </View>
            </View>


          </View>


          <TextInput
            value ={mealDescription}
            placeholder={"Enter meal description"}
            placeholderTextColor={"black"}
            multiline={true}

            numberOfLines={4}
            onChangeText={(value) => {
              setMealDescription(value);
              console.log(value);
            }}
            style={[styles.textInput, {width:"100%"}]}
          />
        </View>
      </View>


      <View style = {{flex:1, alignItems: "center", justifyContent:"space-evenly", flexDirection:"row"}}>

        <TouchableOpacity
          style = {{backgroundColor: '#d6e6cf', padding:"2%", borderRadius: 10}}
          onPress={cancel}
        >
          <Text style = {{fontSize:20, color:"black"}}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style = {{backgroundColor: '#d6e6cf', padding:"2%", borderRadius: 10}}
          onPress={editListing}
        >
          <Text style = {{fontSize:20, color:"black"}}>Save Listing</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style = {{backgroundColor: '#d6e6cf', padding:"2%", borderRadius: 10}}
          onPress={editListing}
        >
          <Text style = {{fontSize:20, color:"black"}}>Delete</Text>
        </TouchableOpacity>
      </View>


    </SafeAreaView>
  )

}
