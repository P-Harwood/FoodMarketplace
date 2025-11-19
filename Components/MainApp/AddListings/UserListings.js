import { TextInput, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";
import React, { useEffect, useState } from "react";
import Config from "../../../resources/Config";
import stylesViewListings from "../../../resources/styles/stylesViewListings";


export default function UserListings(props) {
  const {userDetails, setListingDetails, setCurrentScreen, socket } = props;
  const [meals, setMeals] = useState([]);
  const url = Config("url")

  const [selectedMeal, setSelectedMeal] = useState([]);



  const deleteListing = (userID,mealID) => {
    console.log("deleting", userID, mealID)
    socket.emit("deleteListing", userID, mealID)
  }


  const editListing = (meal) => {
      setListingDetails(meal)
      setCurrentScreen("EditListing")
  }


/*
  const recieveMeal = (meals) => {
    setMeals(meals);
    console.log("Recieve Meal", meals);
  }

  useEffect(() => {
    socket.on("userListings", (meals) => recieveMeal(meals)); // Updated setMeals
    socket.emit("viewOwnListings", userDetails.user_ID);
  }, []);*/

  useEffect(() => {

    const getMeals = async () =>{
      try {
        const response = await fetch(`${url}/returnOwnMeals/${userDetails.user_ID}`, {
          method: 'GET',
        });
        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const allListings = await response.json();
        console.log("ALL", allListings)
        setMeals(allListings);
      } catch (error) {
        console.error('Fetch error:', error);
        // Handle the error appropriately
      }

    };

    getMeals();

  }, []);




  const viewAll= () => {
    return (
      <View style = {{marginRight:"5%", marginLeft:"5%"}}>
        <ScrollView  vertical showsHorizontalScrollIndicator={false}>
          {meals.length > 0 ? (
            meals.map((details) => (
              <View key={details.meal.meal_ID} style = {{backgroundColor:"#d6e6cf", borderWidth:1, borderRadius:10}}>
              <TouchableOpacity
                style={stylesViewListings.chatBoxOptions}
                onPress={() => editListing(details.meal)} // Fix the onPress
              >
                <View style={{flexDirection:"row", margin:"2%"}}>
                  <View style = {{flex:1}}>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${details.retrievedImage}` }}
                      style={{ width: "100%", height: undefined, aspectRatio:1 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style = {{flex:2, margin:"2%"}}>
                    <View style={{flexDirection:"row", margin:"2%"}}>
                      <Text style={{ fontSize: 20, color:"black" }}>{details.meal.meal_Name}</Text>
                      <View style = {{flex:1}}/>
                      <Text style={{ fontSize: 20, color:"black" }}>£{details.meal.meal_Price}</Text>
                    </View>
                    <Text style={{ fontSize: 20, color:"black" }}>{details.meal.meal_Available} Available</Text>
                    <Text style={{ fontSize: 20, color:"black" }}>{details.meal.time_Start_Hour}:{details.meal.time_Start_Minute} - {details.meal.time_End_Hour}:{details.meal.time_End_Minute} </Text>
                  </View>
                </View>
              </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style = {{color: "black", alignSelf:"center", paddingTop:"5%"}}>No listings available.</Text>
          )}
        </ScrollView>
      </View>
    )
  }

  const viewMeal = () => {
    return (
      <View>
        <Text>{selectedMeal.meal_Name}</Text>
        <Text>£{selectedMeal.meal_Price}</Text>
        <Text>{selectedMeal.meal_Description}</Text>
        <Text>x{selectedMeal.meal_Available}</Text>

        <View style = {{flexDirection:"row"}}>
          <TouchableOpacity
            key={"back"}
            style={[stylesViewListings.chatBoxOptions, {flex:1}]}
            onPress={() => setSelectedMeal(null)} // Set the selected meal
          >
            <Text style = {{textAlign:"center"}}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            key={"Edit"}
            style={[stylesViewListings.chatBoxOptions, {flex:1}]}
            onPress={null} // Set the selected meal
          >
            <Text style = {{textAlign:"center"}}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            key={"Delete"}
            style={[stylesViewListings.chatBoxOptions, {flex:1}]}
            onPress={() => {
              socket.emit("deleteListing", userDetails.user_ID, selectedMeal.meal_ID);
              setSelectedMeal(null);
              socket.emit("viewOwnListings", userDetails.user_ID);
            }}
          >
            <Text style = {{textAlign:"center"}}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }



  return (
    <View style={{ flex: 1, backgroundColor:"#EFFFE8"}}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20, color:"black" }}>Your Listings</Text>
      </View>

      <View style={{ flex: 4, width: "100%", borderColor: "#d6e6cf", borderWidth: 1 }}>
        {selectedMeal.length >0 ? viewMeal() : viewAll()}
      </View>

      <View style={{ flex: 1, alignItems: "center", paddingTop:"5%" }}>
        <TouchableOpacity
          style={{ width: "60%", backgroundColor: '#d6e6cf', padding: 10, borderRadius: 10, alignItems: "center" }}
          onPress={() => setCurrentScreen("AddListing")}
        >
          <Text style={{ fontSize: 20, color: "black" }}>Add Listing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
