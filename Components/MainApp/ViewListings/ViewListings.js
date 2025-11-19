import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import styles from "../../../resources/styles/styles";
import stylesViewListings from "../../../resources/styles/stylesViewListings";
import Config from "../../../resources/Config";
import { resolve } from "@babel/core/lib/vendor/import-meta-resolve";
import { FlatList } from "react-native-gesture-handler";
import COLORS from "../../consts/colors";
import moment from "moment";
import stylesListChats from "../../../resources/styles/stylesListChats";

const { width } = Dimensions.get('screen');
const cardWidth = width / 2 - 20;


export default function ViewListings(props) {
  const {messageUserPreparation, userDetails, socket,setModalProfileDetails  } = props;


  const [selectedMeal, setSelectedMeal] = useState(null);

  const [profileDetails, setProfileDetails] = useState(null);
  const [reserveQuantity, setReserveQuantity] = useState(null);
  const [listingAuthor, setListingAuthor] = useState("no name");
  const [formattedMealArray, setFormattedMealArray] = useState();
  const [searchValue, setSearchValue] = useState('');
  const [matchingResults, setMatchingResults] = useState([])

  const url = Config("url")



  const search = (input) => {
    if (input) {
      try {
        if (formattedMealArray) {
          console.log(input)
          const filteredResults = formattedMealArray.filter((meal) =>
            `${meal.meal.meal_Name}`.toLowerCase().includes(input.toLowerCase())
          );
          setMatchingResults(filteredResults);
        } else {
          setMatchingResults([]);
        }
      } catch (error) {
        console.error(error);
        setMatchingResults([]);
      }
    } else {
      setMatchingResults(formattedMealArray || []); // Handle null or undefined fetchedData
    }
    setSearchValue(input);
  };


  const reserveMeals = (meal_ID, reserve_Quantity) => {
    try{
      if (parseInt(reserve_Quantity) > 1){
        socket.emit("ReserveMeal", {
          "meals_ID":meal_ID,
          "user_ID":userDetails.user_ID,
          "reservation_Quantity":reserve_Quantity
        })
        setSelectedMeal(null)
        setReserveQuantity(null)
      }
    } catch{
      console.log("not good number")
    }

  }



  const selectMeal = (meal) =>{
    console.log("selectedMeal:", meal)
    const newMeal = meal.meal
    newMeal.imageBase64 = meal.retrievedImage
    setSelectedMeal(newMeal)
  }





  useEffect(() => {

    const getMeals = async () =>{
      try {
        const response = await fetch(`${url}/returnOrderableMeals/${userDetails.halls_ID}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const allListings = await response.json();
        setFormattedMealArray(allListings);
      } catch (error) {
        console.error('Fetch error:', error);
        // Handle the error appropriately
      }

    };

    getMeals();

  }, []);

  useEffect(() => {
    const getListingAuthorDetails = async () => {
      if (selectedMeal) {
        try {
          const response = await fetch(`${url}/getUserDetails/${selectedMeal.meal_chef_ID}`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const mealAuthorDetails = await response.json();
          console.log("Author Details:", mealAuthorDetails);
          setListingAuthor(mealAuthorDetails);
        } catch (error) {
          console.error('Fetch error:', error);
          // Handle the error gracefully, e.g., display a message to the user
        }
      }
    };

    getListingAuthorDetails();
  }, [selectedMeal]);
  useEffect(() => {
    console.log("profileDetails", profileDetails)
    console.log("listingAuthor", listingAuthor)
  }, [profileDetails]);





  const Card = ({ food }) => {
    const orderEndTime = moment(food.meal.order_end, "YYYY-MM-DDTHH:mm:ss.SSSZ");

    // Get the time away from the current time without the "in" and "ago" prefix/suffix
    const ordersEndIn = orderEndTime.fromNow(true);

    const serveStartTime = moment(food.meal.serving_start, "YYYY-MM-DDTHH:mm:ss.SSSZ");

    const servingEndTime = moment(food.meal.order_end);
    const timeDiff = servingEndTime.diff(moment(), 'minutes');

    console.log("timeDiff", timeDiff)

    let textColor;
    if (timeDiff <= 30) {
      textColor = 'red';
    } else if (timeDiff <= 120) {
      textColor = 'orange'; // or 'amber'
    } else {
      textColor = 'green';
    }


    // Get the time away from the current time without the "in" and "ago" prefix/suffix
    const serveStartIn = serveStartTime.fromNow(true);

    console.log(ordersEndIn);
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => {selectMeal(food)}}>
        <View style={style.card}>
          <View style={{ alignItems: 'center', top: -40 }}>
            <Image source={{ uri: `data:image/jpeg;base64,${food.retrievedImage}` }} style={{ height: 120, width: 120, borderRadius:60 }} />
          </View>
          <View style={{ marginHorizontal: 20 }}>
            <View style={{justifyContent:"space-between"}}>
              <Text style={{ fontSize: 18, textAlign:"center",fontWeight: 'bold', color:"#c3c3c3" }}>{food.meal.meal_Name}</Text>
              <View style = {{flexDirection:"row", justifyContent:"center"}}>
                <Text style={{ fontSize: 18, textAlign:"center",fontWeight: 'bold', color:"#c3c3c3" }}>
                  £{formatPrice(food.meal.meal_Price)}
                </Text>

              </View>

            </View>
            <Text style={{ fontSize: 10, color: textColor, marginTop: 5, textAlign:"center", textAlignVertical:"center" }}>
              {ordersEndIn} left to order
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.grey, marginTop: 2, textAlign:"center" }}>
              Serving in {serveStartIn}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

 const formatPrice = (price) => {
   let stringPrice = price.toString();
   if (stringPrice.includes(".")){
     if (stringPrice.length -  stringPrice.indexOf(".") == 2){
       stringPrice += "0"
     }
   }
   return stringPrice
 }




  const viewMeal =  () => {
    if (selectedMeal) {
      const orderEndTime = moment(selectedMeal.order_end, "YYYY-MM-DDTHH:mm:ss.SSSZ");
      const serveStartTime = moment(selectedMeal.serving_start, "YYYY-MM-DDTHH:mm:ss.SSSZ");

      const orderEndFormatted = orderEndTime.format('MMM Do, YYYY h:mm A');
      const serveStartFormatted = serveStartTime.format('MMM Do, YYYY h:mm A');

      return (
        <View style={{ padding: "2%", paddingTop: "0%", flex: 1 }}>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${selectedMeal.imageBase64}` }}
              style={{ width: "50%", height: undefined, aspectRatio: 1 }}
              resizeMode="contain"
            />
          </View>

          <View style={{ flex: 2, margin: "5%", paddingTop: "10%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: "5%" }}>

              <View style={{ width: "100%" }}>
                <Text style={{ color: "black", fontSize: 30 }}>{selectedMeal.meal_Name}</Text>

                <View style={{ flexDirection: "row", width: "100%" }}>
                  <TouchableOpacity onPress={() => {
                    setModalProfileDetails(listingAuthor)
                  }} style={{ alignSelf: "flex-start", margiRight: "20%", flex: 1 }}>
                    <Text style={{
                      color: "#c3c3c3",
                      fontSize: 15,
                      fontStyle: "italic",
                      textAlign: "left"
                    }}>by {listingAuthor.user_F_Name} {listingAuthor.user_L_Name}</Text>
                  </TouchableOpacity>

                  <Text style={{
                    color: "black",
                    paddingBottom: "10%",
                    fontSize: 30,
                    marginLeft: "20%"
                  }}>£{formatPrice(selectedMeal.meal_Price)}</Text>
                </View>
              </View>


            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "black", fontSize: 15 }}>{selectedMeal.meal_Description}</Text>
            </View>

          </View>
          <View style={{ flexDirection: "row", flex: 1 }}>


            <TextInput
              value={reserveQuantity !== null ? reserveQuantity.toString() : ''}
              placeholder={`Order Quantity (${selectedMeal.meal_Available} Available)`}
              placeholderTextColor={"black"}
              keyboardType="numeric"
              onChangeText={(value) => {
                if (value === '') {
                  setReserveQuantity(null); // or setReserveQuantity(0) if you prefer
                } else {
                  const number = parseInt(value, 10);
                  if (!isNaN(number)) {
                    setReserveQuantity(number);
                  } else {

                  }
                }

              }}

              style={[styles.textInput, { flex: 1, alignSelf: "center", marginBottom: "0%", marginLeft: "7%" }]}
            />
            <View style={{
              marginHorizontal: "10%",

              alignSelf: "center",
              height: 50,
              justifySelf: "center",
              alignItems: "stretch",
              color: "#240090",
              borderRadius: 5,
              flexDirection: "row",
              justifyContent: "space-between"


            }}>

              <Text style={{ textAlignVertical: "center", color: "black" }}>Total: £</Text>

              <Text
                style={{ textAlignVertical: "center", color:"grey" }}>{reserveQuantity ? formatPrice(reserveQuantity * selectedMeal.meal_Price) : "0.00"}</Text>


            </View>

          </View>
          <View style = {{padding:"2%", paddingTop:"0%"}}>
            <Text style={{
              fontSize: 15,
              color: COLORS.grey,
              marginTop: 5,
              textAlign: "center",
              textAlignVertical: "center"
            }}>
              Orders close at: {orderEndFormatted}
            </Text>
            <Text style={{ fontSize: 15, color: COLORS.grey, marginTop: 2, textAlign: "center" }}>
              Serving starts at {serveStartFormatted}
            </Text>

          </View>


          <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>


            <TouchableOpacity
              key={"back"}
              style={{ backgroundColor: 'white', padding: 10, borderRadius: 5, borderColor: "#c3c3c3", borderWidth: 1 }}
              onPress={backButton} // Set the selected meal
            >
              <Text style={{
                textAlign: "center",
                color: "black",
                fontSize: 20,
                paddingRight: "10%",
                paddingLeft: "10%"
              }}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              key={"reserve"}
              style={{ backgroundColor: 'white', padding: 10, borderRadius: 5, borderColor: "#c3c3c3", borderWidth: 1 }}
              onPress={() => reserveMeals(selectedMeal.meal_ID, reserveQuantity)} // Set the selected meal
            >
              <Text style={{
                textAlign: "center",
                color: "black",
                fontSize: 20,
                paddingRight: "10%",
                paddingLeft: "10%"
              }}>Reserve</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }
  const backButton = () => {
   setSelectedMeal(null);
   setReserveQuantity(null);
  }

  const viewAll = () => {




    if (formattedMealArray && formattedMealArray.length > 0) {
      return (
        <FlatList
          showsVerticalScrollIndicator={false}
          numColumns={2}
          data={searchValue ? matchingResults : formattedMealArray}
          renderItem={({ item }) => <Card food={item} />}
          keyExtractor={(item, index) => index.toString()}
        />
      );
    } else {
      console.log("Meal image array is empty or null.");
      return <View>
        <Text style = {{color:"black", alignSelf:"center", paddingTop:"5%"}}>No listings available.</Text>
      </View>;
    }
  };









  return (
    <View style={{ flex: 1, width: "100%", backgroundColor:"#f9f9f9" }}>
      <View style={{ padding:"2%", paddingBottom:"2%" }}>
        {selectedMeal ?  null : <Text style={{paddingLeft: "5%", fontSize:30, textAlign:"left", color:"#c1c1c1"}}>View Advertisements</Text>}
      </View>

      {selectedMeal ?  null :
      <View style = {{ width:"100%"}}>
        <TextInput
          value={searchValue}
          placeholder="Search for a meal..."
          placeholderTextColor={"grey"}
          onChangeText={(text) => search(text)}
          style={[stylesListChats.textInput,{marginLeft:"1%"}]}
        />
      </View>}

      <View style={{ flex: 1,  width: "100%"}}>
        {selectedMeal ? viewMeal(): viewAll()}
      </View>
      <Modal
        visible={false}
        animationType="none"
        transparent={true}
        onRequestClose={() => setProfileDetails(null)}
      >

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection:"row"}}>


          <TouchableOpacity style = {{position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'}} onPress={() => {setProfileDetails(null)}}/>


          <View style = {{height: "80%", width: "80%", backgroundColor:"white",  alignSelf:"flex-start", justifyContent:"center", marginTop:"20%", borderRadius:20}}>


            <View style = {{height:"100%", width: "100%",  flexDirection:"row", paddingHorizontal:"5%", alignContent:"center", justifyContent:"center", borderBottomWidth:1, borderColor: "#d3d3d3"}}>

              <View style = {{alignSelf:"center", width: "100%", alignContent:"center"}}>
                <View style={{ marginTop:"5%", justifyContent: "center", alignSelf:"center" }}>
                  <Image
                    source={require('../../../assets/defaultProfile.png')}
                    style={{ height: 100, width: 100, borderRadius: 50}}
                  />
                  <TouchableOpacity style = {{flexDirection:"row", justifyContent:"center"}} onPress={() => {setProfileDetails(listingAuthor)}}>
                    {listingAuthor ?<Text>{listingAuthor.user_F_Name} </Text> : null}
                    {listingAuthor ?<Text>{listingAuthor.user_L_Name} </Text> : null}
                  </TouchableOpacity>
                </View>
                <View style = {{flex:1}}/>



                <View style={{ marginVertical: "5%", alignSelf:"flex-end", justifyContent:"space-evenly", flexDirection:"row", width: "100%"}} >

                  <TouchableOpacity onPress={() => {setProfileDetails(null)}}>
                    <Text>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress = {() => {messageUserPreparation(listingAuthor.user_ID)}}>
                    <Text>Message User</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>


          </View>


        </View>

      </Modal>
    </View>
  );
}
const style = StyleSheet.create({
  header: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  inputContainer: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: COLORS.light,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sortBtn: {
    width: 50,
    height: 50,
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesListContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  categoryBtn: {
    height: 45,
    marginRight: 7,
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingRight:30,
    flexDirection: 'row',
  },
  categoryBtnImgCon: {
    height: 35,
    width: 35,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {

    width: cardWidth,
    marginHorizontal: 10,
    marginBottom: 20,
    paddingBottom:"5%",
    marginTop: 50,
    borderRadius: 15,
    elevation: 10,
    backgroundColor: COLORS.white,
  },
  addToCartBtn: {
    height: 30,
    width: 30,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
