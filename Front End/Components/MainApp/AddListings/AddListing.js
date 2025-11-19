import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Button,
  FlatList,
  ScrollView,
  Switch,
  Image, Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "../../../resources/styles/stylesAddListing";
import CheckBox from '@react-native-community/checkbox';
import Config from "../../../resources/Config";
import ImagePicker from 'react-native-image-crop-picker';
import COLORS from "../../consts/colors";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";



export default function AddListing(props){


  const {userDetails, setScreen, socket} = props;

  const url = Config("url")


  const [mealName, setMealName] = useState();
  const [mealPrice, setMealPrice] = useState();
  const [mealQuantity, setMealQuantity] = useState();
  const [mealDescription, setMealDescription] = useState();
  const [mealPicture, setMealPicture] = useState();


  const [showCustomerOrderTime, setShowCustomerOrderTime] = useState(false);
  const [showCustomerServeTime, setShowCustomerServeTime] = useState(false);
  const [showAllergy, setShowAllergy] = useState(false);
  const [errorPrompts, setErrorPrompts] = useState([]);


  const [mealPictureUri, setMealPictureUri] = useState();




  const [orderStart, setOrderStart] = useState('');
  const [orderEnd, setOrderEnd] = useState('');
  const [reservationStart, setReservationStart] = useState('');
  const [reservationEnd, setReservationEnd] = useState('');

  const [currentTimeSelect, setCurrentTimeSelect] = useState('');



  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [dietaryRequirements, setDietaryRequirements] = useState([
    { name: "Peanuts", present: false },
    { name: "Fish", present: false },
    { name: "Milk", present: false },
    { name: "Eggs", present: false },
    { name: "Wheat", present: false },
    { name: "Soy", present: false },
    { name: "Kosher meat", present: false },
    { name: "Halal meat", present: false },
    { name: "Vegetarian", present: false },
    { name: "Vegan", present: false }
  ]);


  const showDatePicker = (type) => {
    setCurrentTimeSelect(type)
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    if (currentTimeSelect === "order start"){
      setOrderStart(date)
    }else if (currentTimeSelect === "order end"){
      setOrderEnd(date)
    } else if (currentTimeSelect === "reservation start"){
      setReservationStart(date)
    } else if (currentTimeSelect === "reservation end"){
      setReservationEnd(date)
    }
    hideDatePicker();
    console.log(date)
  };

  const imageSelector = () => {




    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true
    }).then(image => {
      console.log(image);
      console.log(image.path);
      setMealPictureUri(image.path)
    }).catch(error => {
      console.log("RN-I-C-P Error", error)
    });

  };


  const changeBoolean = (allergenName) => {
    // Find the index of the allergen with the given name
    const index = dietaryRequirements.findIndex(item => item.name === allergenName);
    // Toggle the present property if the allergen is found
    if (index !== -1) {
      // Create a new array with updated allergen object
      const updatedRequirements = [...dietaryRequirements];
      updatedRequirements[index] = { ...updatedRequirements[index], present: !updatedRequirements[index].present };
      // Update the state with the new array
      setDietaryRequirements(updatedRequirements);
    }
  };


  const DietaryOption = ({ option }) => {
    return (
      <TouchableOpacity style={{ marginHorizontal: 20 , flexDirection:"row", borderRadius:10, borderWith:1, borderColor:"#D1FFBD", marginTop:"1%"}} onPress = {null}>
        <View style={{flex:1}}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft:"5%", paddingLeft:"5%" }}>{option.name}</Text>
        </View>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={option.present ? '#f4f3f4' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => changeBoolean(option.name)} // Corrected
          style={{justifyContent:"flex-end"}}
          value={option.present}
        />
      </TouchableOpacity>
    );
  };


  const timeFormatDisplayer = (timeString) => {
    const unformattedTime = moment(timeString, "YYYY-MM-DDTHH:mm:ss.SSSZ");

    // Get the time away from the current time without the "in" and "ago" prefix/suffix
    const formatted = unformattedTime.format("lll");
    return formatted
  };


  const sendImageToServer = async (imageUri) => {
    //sends the image to the server
    try {
      //try is to prevent arrays
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'test.jpg'
      });
      //grabs the response
      const response = await fetch(`${url}/uploadImage/${userDetails.user_ID}`, {
        method: 'POST',
        body: formData
      });

      //if the response is 200 (everything is alright) then return server path
      const status =  response.status;
      const responseJSON = await response.json()
      console.log("status", status)
      console.log("responseJSON", responseJSON.outputPath)
      if (status === 200) {
        return { outcome:"success", path: responseJSON.outputPath }
      } else {
        return { outcome:"error"}
        console.error(`Error uploading image. Status code: ${status}`);
      }
    } catch (error) {
      console.error("error", error);
    }
  };




  useEffect(() => {
    console.log(mealPictureUri)
    const sendImage = async () => {
      if (mealPictureUri) {
        try {
          const result = await sendImageToServer(mealPictureUri);
          if (result.outcome === "success") {
            console.log("uploaded");
            console.log(result.path)
            setMealPicture(result.path);
            setMealPictureUri(null)
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };

    sendImage();
  }, [mealPictureUri]);




  const validateMealDetails = () => {
    const mealDetailsArray = [mealName, mealPrice, mealQuantity, mealDescription, mealPicture, orderStart, orderEnd, reservationStart,reservationEnd]

    const issues = []

    mealDetailsArray.forEach((detail, index) => {
      if (detail === null || detail === "") {
        issues.push("Please fill out all details for the meal.");
      }
    });

    if (!/^\d+(\.\d+)?$/.test(mealPrice) || parseFloat(mealPrice) < 0) {
      issues.push("Please ensure that the meal price is a correct non-negative number.");
    }

    if (!/^\d+$/.test(mealQuantity) || parseInt(mealQuantity, 10) < 1) {
      issues.push("Please ensure that the available meal quantity is correct and at least 1.");
    }

    const orderStartTime = moment(orderStart, "YYYY-MM-DDTHH:mm:ss.SSSZ");
    const orderEndTime = moment(orderEnd, "YYYY-MM-DDTHH:mm:ss.SSSZ");
    const serveStartTime = moment(reservationStart, "YYYY-MM-DDTHH:mm:ss.SSSZ");
    const servingEndTime = moment(reservationEnd, "YYYY-MM-DDTHH:mm:ss.SSSZ");

    if (!orderStartTime.isBefore(orderEndTime)) {
      issues.push("Order start time should be before the order end time.");
    }
    if (!orderEndTime.isBefore(serveStartTime)) {
      issues.push("Order end time should be before the serving start time.");
    }
    if (!serveStartTime.isBefore(servingEndTime)) {
      issues.push("Serving start time should be before the serving end time.");
    }
    console.log(issues)
    return issues

  }

  const addListing = () => {
    /* used for validating the information of a
    listing and then passing it onto the server
     */


    // assemble all parameters into one array
    let errorMessages = validateMealDetails();
    if (!errorMessages.length > 0) {
      // assemble the array into a dictionary
      const listingDetails = {
        "user_ID": userDetails.user_ID,
        "halls_ID": userDetails.halls_ID,
        "meal_Name": mealName,
        "meal_Price": mealPrice,
        "meal_Quantity": mealQuantity,
        "meal_Description": mealDescription,
        "meal_Image_Location": mealPicture ? mealPicture : "./public/Images/noImage.jpg",
        "serving_start": reservationStart,
        "serving_end": reservationEnd,
        "order_start": orderStart,
        "order_end": orderEnd,
        "dietary": dietaryRequirements
      }
      //send the dictionary to the server
      socket.emit("AddListing", listingDetails);
      // exit the add listing screen
      setScreen("Sell")
    } else {
      setErrorPrompts(errorMessages);
    }
  }


 const mealNameChangedFunction = (text) => {
    if (text){
      if (text.length <= 20){
        setMealName(text)
      }
    }else {
      setMealName(null)
    }
 }


  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor:"#f9f9f9" }}>
      <SafeAreaView style={{ flex: 1}}>


      <View style = {{flexDirection:"row",width:"100%", alignSelf:"center", flex:1}}>
        {!mealPicture ?
          <TouchableOpacity onPress={imageSelector} style = {{borderColor:"black",padding:10, width: "100%", height: "100%", justifyContent:"center", backgroundColor:"#f9f9f9"}}>
            <Text style = {{color:"black", alignSelf:"center"}}>Add Image</Text>

          </TouchableOpacity>
          : null

        }
        </View>



      <View style = {{flex:8, width: "100%"}}>
        <View style = {{ alignItems: 'center', width: "100%"}}>
          <View style = {{flexDirection:"row", borderBottomWidth:1, borderColor:"#f9f9f9"}}>
          <TextInput
            value={mealName}
            placeholder="Title"
            placeholderTextColor="#949494"
            onChangeText={(value) => {
              mealNameChangedFunction(value);
              console.log(value);
            }}
            style={[styles.textInput, {flex:1, marginBottom: 0, borderWidth: 0, paddingLeft:"5%"}]}
          />
            {mealName ? <View style = {{paddingRight:"2%", backgroundColor:"white", justifyContent:"flex-end"}}>
              <Text style={{ color: mealName.length === 20 ? "red" : "#c3c3c3" }}>
                {20-mealName.length}
              </Text>
            </View> : null}
          </View>



          <View style = {{flexDirection:"row"}}>
          <TextInput
            value ={mealDescription}
            placeholder={"Description"}
            placeholderTextColor="#949494"
            multiline={true}

            numberOfLines={4}
            onChangeText={(value) => {
              setMealDescription(value);
              console.log(value);
            }}
            style={[styles.textInput, {width:"100%", marginBottom:"1%", borderWidth: 0, borderRadius: 0, height:"100%", paddingLeft:"5%", textAlignVertical:"top"}]}
          />
          </View>




          <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"5%"}}>

            <View style = {{flex:2, justifyContent:"center", borderRightWidth:1, borderColor:"lightgrey"}}>
              <Text style = {{paddingLeft:"5%", color:"#949494", fontSize:20}}>Price</Text>
            </View>

            <View style = {{flex:1, justifyContent:"center"}}>
              <TextInput
                value ={mealPrice}
                placeholder={"£ Amount"}
                placeholderTextColor="#949494"
                keyboardType="numeric"
                onChangeText={(value) => {
                  setMealPrice(value);
                  console.log(value);
                }}
                style={{width:"100%", paddingLeft:"5%", color:"black" }}
              />
            </View>

          </View>



          <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"1%"}}>

            <View style = {{flex:2, justifyContent:"center", borderRightWidth:1, borderColor:"lightgrey"}}>
              <Text style = {{paddingLeft:"5%", fontSize:20, color:"#949494"}}>Available portions</Text>
            </View>

            <View style = {{flex:1, justifyContent:"center"}}>
              <TextInput
                value ={mealQuantity}
                placeholder={" x Quantity"}
                placeholderTextColor="#949494"
                keyboardType="numeric"
                onChangeText={(value) => {
                  setMealQuantity(value);
                  console.log(value);
                }}
                style={{width:"100%", paddingLeft:"5%", color:"black" }}
              />
            </View>

          </View>







          <TouchableOpacity style = {{width: "100%", padding:"2%",paddingLeft:"5%", backgroundColor:"white", marginTop:"2%"}} onPress={() => setShowCustomerOrderTime(!showCustomerOrderTime)}>
            <View style = {{flexDirection:"row"}}>
              <Text style = {{fontSize:20, color:"#949494", flex:4}}>Customer Ordering Times</Text>
              <Text style = {{fontSize:20, color:"#949494", flex:1, textAlign:"right", paddingRight:"5%"}}>{showCustomerOrderTime?"-":"+"}</Text>

            </View>


          </TouchableOpacity>

          {showCustomerOrderTime? <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"1%"}}>

            <TouchableOpacity
              style={{ flex: 1, justifyContent: "center", borderRightWidth: 1, borderColor: "lightgrey", paddingBottom:15 , paddingTop:15 }}
              onPress={() => {
                showDatePicker("order start")
              }}
            >
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>Orders Start Time:</Text>
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>{orderStart ? timeFormatDisplayer(orderStart).toLocaleString() : "Not selected"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, justifyContent: "center", borderRightWidth: 1, borderColor: "lightgrey" }}
              onPress={() => {
                showDatePicker("order end")
              }}
            >
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>Final Orders Time:</Text>
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>{orderEnd ? timeFormatDisplayer(orderEnd).toLocaleString() : "Not selected"}</Text>
            </TouchableOpacity>



          </View>:null}



          <TouchableOpacity style = {{width: "100%", padding:"2%",paddingLeft:"5%", backgroundColor:"white", marginTop:"2%"}} onPress={() => setShowCustomerServeTime(!showCustomerServeTime)}>
            <View style = {{flexDirection:"row"}}>
              <Text style = {{fontSize:20, color:"#949494", flex:4}}>Customer Serving Times</Text>
              <Text style = {{fontSize:20, color:"#949494", flex:1, textAlign:"right", paddingRight:"5%"}}>{showCustomerServeTime?"-":"+"}</Text>

            </View>

          </TouchableOpacity>

          {showCustomerServeTime? <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"1%"}}>

            <TouchableOpacity
              style={{ flex: 1, justifyContent: "center", borderRightWidth: 1, borderColor: "lightgrey", paddingBottom:15 , paddingTop:15 }}
              onPress={() => {
                showDatePicker("reservation start")
              }}
            >
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>Serving Start Time:</Text>
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>{reservationStart ? timeFormatDisplayer(reservationStart).toLocaleString() : "Not selected"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, justifyContent: "center", borderRightWidth: 1, borderColor: "lightgrey" }}
              onPress={() => {
                showDatePicker("reservation end")
              }}
            >
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>Serving End Time:</Text>
              <Text style={{ paddingLeft: "5%",  color:"#949494" }}>{reservationEnd ? timeFormatDisplayer(reservationEnd).toLocaleString() : "Not selected"}</Text>
            </TouchableOpacity>



          </View>:null}

          {/*<TouchableOpacity style = {{width: "100%", padding:"2%",paddingLeft:"5%", backgroundColor:"white", marginTop:"2%"}} onPress={() => setShowAllergy(!showAllergy)}>
            <View style = {{flexDirection:"row"}}>
              <Text style = {{fontSize:20, color:"#949494", flex:4}}>Dietary Information</Text>
              <Text style = {{fontSize:20, color:"#949494", flex:1, textAlign:"right", paddingRight:"5%"}}>{showAllergy?"-":"+"}</Text>

            </View>

          </TouchableOpacity>

          {showAllergy? <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"1%"}}>


            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {dietaryRequirements.map((item, index) => (
                <View key={index} style={{ width: '50%' }}>
                  <DietaryOption option={item} />
                </View>
              ))}
            </View>



          </View>:null}*/}




        </View>

      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />


      <View style = {{flex:1, alignItems: "center", flexDirection:"row", justifyContent:"space-evenly", marginBottom:"5%"}}>
        <TouchableOpacity
          style = {{backgroundColor: 'white', padding:10, borderRadius: 5}}
          onPress={() => {setScreen("Sell")}}
        >
          <Text style = {{fontSize:20, color:"black"}}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style = {{backgroundColor: 'white', padding:10, borderRadius: 5}}
          onPress={addListing}
        >
          <Text style = {{fontSize:20, color:"black"}}>Add Listing</Text>
        </TouchableOpacity>
      </View>

        <Modal
          visible={errorPrompts && errorPrompts.length > 0}
          animationType="none"
          transparent={true}
          onRequestClose={() => setReviewDetails(null)}
        >

          <View style={{ flex: 1, width: "100%", alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>


            <TouchableOpacity style = {{position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height:"100%",
              backgroundColor: 'rgba(0, 0, 0, 0.5)'}} onPress={() => {setErrorPrompts([])}}/>


            <View  style = {{width: "80%", backgroundColor:"white",  alignSelf:"center", justifyContent:"center", marginTop:"10%", borderRadius:20, padding:"10%"}}>
              <Text>Please fix these issues before editing this listing:</Text>
              <ScrollView>
                {errorPrompts.length > 0 ? (
                  errorPrompts.map((error, index) => (
                    <Text key={index} style={{paddingLeft: 10, marginTop: 5}}>
                      • {error}
                    </Text>
                  ))
                ) : (
                  <Text style={{paddingLeft: 10, marginTop: 5}}>No issues found.</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
    </ScrollView>
  )

}
