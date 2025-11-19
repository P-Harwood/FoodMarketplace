import { TextInput, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Image, Modal } from "react-native";
import React, {useState} from 'react';
import styles from "../../../resources/styles/stylesAddListing";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ImagePicker from "react-native-image-crop-picker";
import moment from "moment";







export default function EditListings (props) {
  const {userDetails, itemToEdit, clearEditItem, socket} = props;




  const formatPrice = (price) => {
    try{
      let stringPrice = price.toString();
      if (stringPrice.includes(".")){
        if (stringPrice.length -  stringPrice.indexOf(".") == 2){
          stringPrice += "0"
        }
      }
      return stringPrice
    }
    catch{
      return price
    }
  }

  const [showCustomerOrderTime, setShowCustomerOrderTime] = useState(false);
  const [showCustomerServeTime, setShowCustomerServeTime] = useState(false);
  const [showAllergy, setShowAllergy] = useState(false);

  const [currentTimeSelect, setCurrentTimeSelect] = useState('');

  const [mealPictureUri, setMealPictureUri] = useState();

  const [errorPrompts, setErrorPrompts] = useState([]);

  const [mealID, setMealID] = useState(itemToEdit.meal.meal_ID);

  const [mealName, setMealName] = useState(itemToEdit.meal.meal_Name);
  const [mealPrice, setMealPrice] = useState(formatPrice(Number(itemToEdit.meal.meal_Price)));
  const [mealAvailable, setMealAvailable] = useState(Number(itemToEdit.meal.meal_Available));
  const [mealDescription, setMealDescription] = useState(itemToEdit.meal.meal_Description);
  const [mealQuantity, setMealQuantity] = useState(itemToEdit.meal.meal_Quantity);
  const [mealPicture, setMealPicture] = useState(itemToEdit.Image);


  const [orderStart, setOrderStart] = useState(itemToEdit.meal.order_start);
  const [orderEnd, setOrderEnd] = useState(itemToEdit.meal.order_end);
  const [reservationStart, setReservationStart] = useState(itemToEdit.meal.serving_start);
  const [reservationEnd, setReservationEnd] = useState(itemToEdit.meal.serving_end);

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


  const cancel = () => {
    clearEditItem()
  }




  const validateMealDetails = () => {
    const mealDetailsArray = [mealName, mealPrice, mealAvailable, mealDescription, mealPicture, orderStart, orderEnd, reservationStart,reservationEnd]

    const issues = []

    mealDetailsArray.forEach((detail, index) => {
      if (detail === null || detail === "") {
        issues.push("Please fill out all details for the meal.");
      }
    });

    if (!/^\d+(\.\d+)?$/.test(mealPrice) || parseFloat(mealPrice) < 0) {
      issues.push("Please ensure that the meal price is a correct non-negative number.");
    }

    if (!/^\d+$/.test(mealAvailable) || parseInt(mealAvailable, 10) < 1) {
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





  const editListing = () => {


    let errorMessages = validateMealDetails();

    if (!errorMessages.length > 0){
      const DetailsFormat = {
        "user_ID":userDetails.user_ID,
        "meal_ID":mealID,
        "halls_ID":userDetails.halls_ID,
        "meal_Name":mealName,
        "meal_Price":parseFloat(mealPrice),
        "meal_Available":parseInt(mealAvailable, 10),
        "meal_Description":mealDescription,
        "meal_Image_Location":mealPicture,
        "serving_start":reservationStart,
        "serving_end":reservationEnd,
        "order_start":orderStart,
        "order_end":orderEnd,
        "dietary": dietaryRequirements

      }
      socket.emit("editListing",DetailsFormat);
      cancel()
    }
    else{
      setErrorPrompts(errorMessages);
    }

  }


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
  };

  const imageSelector = () => {




    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true
    }).then(image => {
      setMealPictureUri(image.path)
    }).catch(error => {
      console.log("RN-I-C-P Error", error)
    });

  };


  const timeFormatDisplayer = (timeString) => {
    const unformattedTime = moment(timeString, "YYYY-MM-DDTHH:mm:ss.SSSZ");

    // Get the time away from the current time without the "in" and "ago" prefix/suffix
    const formatted = unformattedTime.format("Do MMM, h:mm a");
    return formatted
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
  const mealNameChangedFunction = (text) => {
    if (text){
      if (text.length <= 20){
        setMealName(text)
      }
    }else {
      setMealName(null)
    }
  }

  const deleteListing = () => {
    socket.emit("Cancel Listing", userDetails.user_ID, mealID);
    cancel();
  }




  return (<>
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor:"#f9f9f9" }}>
      <SafeAreaView style={{ flex: 1}}>


        <View style = {{flexDirection:"row",width:"100%", alignSelf:"center", flex:1}}>
          {!mealPicture ?
            <TouchableOpacity onPress={imageSelector} style = {{borderColor:"black",padding:10, width: "100%", height: "100%", justifyContent:"center", backgroundColor:"#f9f9f9"}}>
              <Text style = {{color:"black", alignSelf:"center"}}>Add Image</Text>

            </TouchableOpacity>
            :  <View style = {{alignItems:"center", width:"100%", paddingTop:"2%"}}>
              <Image source={{ uri: mealPicture }} style={{ height: 120, width: 120 }} />
            </View>

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
                style={[styles.textInput, {width:"100%", marginBottom:"1%", borderWidth: 0, borderRadius: 0, height:"100%", paddingLeft:"5%",textAlignVertical:"top"}]}
              />
            </View>




            <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"5%"}}>

              <View style = {{flex:1, justifyContent:"center", borderRightWidth:1, borderColor:"lightgrey"}}>
                <Text style = {{fontSize:20, paddingLeft:"5%"}}>Price</Text>
              </View>

              <View style = {{flex:1, justifyContent:"center", flexDirection:"row"}}>
                <Text style={{marginLeft: "20%", textAlignVertical: "center", color: "black", lineHeight: 28, fontSize:13}}>
                  {mealPrice ? "£" : null}
                </Text>
                <TextInput
                  value ={mealPrice ? mealPrice.toString() : null}
                  placeholder={"£ Amount"}
                  placeholderTextColor="#949494"
                  placeholderTextSize
                  keyboardType="numeric"
                  onChangeText={(value) => {setMealPrice(value)}}
                  style={{width: "100%",  paddingLeft: "1%", fontSize:15}}
                />
              </View>

            </View>


            <View style = {{flexDirection:"row", backgroundColor:"white", marginTop:"1%"}}>

              <View style = {{flex:1, justifyContent:"center", borderRightWidth:1, borderColor:"lightgrey"}}>
                <Text style = {{fontSize:20,paddingLeft:"5%"}}>Available portions</Text>
              </View>

              <View style = {{flex:1, justifyContent:"center"}}>
                <TextInput
                  value ={mealAvailable ?  mealAvailable.toString() : null}
                  placeholder={" x Quantity"}
                  placeholderTextColor="#949494"
                  keyboardType="numeric"
                  onChangeText={(value) => {
                    if (value === '') {
                      setMealAvailable(null); // or setReserveQuantity(0) if you prefer
                    } else {
                      const number = parseInt(value, 10);
                      if (!isNaN(number)) {
                        setMealAvailable(number);
                      } else {
                        setMealAvailable(null);
                      }
                    }
                  }}
                  style={{width:"100%", paddingLeft:"5%" }}
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
                <Text style={{ paddingLeft: "5%" }}>Orders Start Time:</Text>
                <Text style={{ paddingLeft: "5%" }}>{orderStart ? timeFormatDisplayer(orderStart).toLocaleString() : "Not selected"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, justifyContent: "center", borderRightWidth: 1, borderColor: "lightgrey" }}
                onPress={() => {
                  showDatePicker("order end")
                }}
              >
                <Text style={{ paddingLeft: "5%" }}>Final Orders Time:</Text>
                <Text style={{ paddingLeft: "5%" }}>{orderEnd ? timeFormatDisplayer(orderEnd).toLocaleString() : "Not selected"}</Text>
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
                <Text style={{ paddingLeft: "5%" }}>Serving Start Time:</Text>
                <Text style={{ paddingLeft: "5%" }}>{reservationStart ? timeFormatDisplayer(reservationStart).toLocaleString() : "Not selected"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, justifyContent: "center", borderRightWidth: 1, borderColor: "lightgrey" }}
                onPress={() => {
                  showDatePicker("reservation end")
                }}
              >
                <Text style={{ paddingLeft: "5%" }}>Serving End Time:</Text>
                <Text style={{ paddingLeft: "5%" }}>{reservationEnd ? timeFormatDisplayer(reservationEnd).toLocaleString() : "Not selected"}</Text>
              </TouchableOpacity>



            </View>:null}
            {/*

            <TouchableOpacity style = {{width: "100%", padding:"2%",paddingLeft:"5%", backgroundColor:"white", marginTop:"2%"}} onPress={() => setShowAllergy(!showAllergy)}>
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



            </View>:null}

            */}


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
            style = {{backgroundColor: 'white', padding:10, borderRadius: 5, borderWidth:1}}
            onPress={cancel}
          >
            <Text style = {{fontSize:20, color:"black"}}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style = {{backgroundColor: '#4f199c', padding:10, borderRadius: 5, borderWidth:1}}
            onPress={editListing}
          >
            <Text style = {{fontSize:20, color:"white"}}>Save changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style = {{backgroundColor: 'white', padding:10, borderRadius: 5, borderWidth:1}}
            onPress={deleteListing}
          >
            <Text style = {{fontSize:20, color:"black"}}>Delete</Text>
          </TouchableOpacity>


        </View>


      </SafeAreaView>
    </ScrollView>
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
    </>
  )

}
