import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, ScrollView, TextInput } from "react-native";
import styles from "../../../resources/styles/styles";
import stylesViewListings from "../../../resources/styles/stylesViewListings";
import Config from "../../../resources/Config";
import { resolve } from "@babel/core/lib/vendor/import-meta-resolve";

export default function ViewReservations(props) {
  const {userDetails, socket } = props;


  const [selectedMeal, setSelectedMeal] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("ViewReservations");


  const [reserveQuantity, setReserveQuantity] = useState(null);
  const [formattedMealArray, setFormattedMealArray] = useState();

  const url = Config("url")




  const reserveMeals = (meal_ID, reserve_Quantity) => {
    socket.emit("ReserveMeal", {
      "meals_ID":meal_ID,
      "user_ID":userDetails.user_ID,
      "reservation_Quantity":reserve_Quantity
    })
    setSelectedMeal(null)
  }


  const getMeals = async () =>{
    try {
      const response = await fetch(`${url}/returnReservations/${userDetails.user_ID}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const allListings = await response.json();
      console.log("ALL", allListings)
      setFormattedMealArray(allListings);
    } catch (error) {
      console.error('Fetch error:', error);

    }

  };



  useEffect(() => {
    const updateReservations = () => {
      socket.on("updateListing", getMeals); // Pass getMeals as a callback
    };

    getMeals();
    updateReservations();

    return () => {
      socket.off("updateListing", getMeals);
    };
  }, []);




  const deleteReservation = (reservationID, reserveQuantity, meal_ID) => {
    socket.emit("deleteReservation", reservationID, reserveQuantity, meal_ID)
  }








  const viewAll = () => {

    if (formattedMealArray && formattedMealArray.length > 0) {

      return (
        <View style={{ marginRight: "5%", marginLeft: "5%" }}>
          <ScrollView vertical showsHorizontalScrollIndicator={false}>
            {formattedMealArray.map((details) => (
              <View key={details.meal.meal_Reservation_ID}
                    style={{ backgroundColor: "#d6e6cf", borderWidth: 1, borderRadius: 10 }}>
                <View
                  style={stylesViewListings.chatBoxOptions}
                >
                  <View style={{ flexDirection: "row", margin: "2%" }}>
                    <View style={{ flex: 1 }}>
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${details.retrievedImage}` }}
                        style={{ width: "100%", height: undefined, aspectRatio: 1 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 2, margin: "2%" }}>
                      <View style={{ flexDirection: "row", margin: "2%" }}>
                        <Text style={{ fontSize: 20, color: "black" }}>{details.meal.meal_Name}</Text>
                        <Text style={{ fontSize: 20, color: "black" }}>£{details.meal.meal_Price}</Text>
                      </View>
                      <Text style={{ fontSize: 20, color: "black" }}>{details.meal.reservation_Quantity} Reserved</Text>


                      <View style = {{flexDirection:"row"}}>
                        <TouchableOpacity
                          style={[stylesViewListings, { marginRight: "10%" }]}
                          onPress={() => selectMeal(details.meal)} // Ensure selectMeal is defined and works correctly
                        >
                          <Text>Open chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[stylesViewListings, { marginRight: "2%" }]}
                          onPress={() => deleteReservation(details.meal.meal_Reservation_ID, details.meal.reservation_Quantity, details.meal.meal_ID)} // Ensure selectMeal is defined and works correctly
                        >
                          <Text>Delete Reservation</Text>
                        </TouchableOpacity>
                      </View>


                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    } else {
      return (
        <View>
          <Text style={{ color: "black", alignSelf: "center", paddingTop: "5%" }}>No reservations.</Text>
        </View>
      );
    }
  }






  return (
    <View style={{ flex: 1, width: "100%", color: "#EFFFE8", padding:"5%" }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} />

        <View style={{ alignItems: "center" }}>
          <Text style={[styles.text, {color: "black"}]}>View Reservations</Text>
        </View>

        <View style={{ flex: 1 }} />
      </View>

      <View style={{ flex: 8, borderColor: "#e3fad9", borderWidth: 1, width: "100%", padding:"2%"}}>
        {viewAll()}
      </View>

      <View style={{ flex: 1 }} />
    </View>
  );
}
