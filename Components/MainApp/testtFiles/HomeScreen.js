import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image, Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  FlatList,
  Text,
  View, TextInput, KeyboardAvoidingView,
} from "react-native";

import COLORS from '../../consts/colors';

import Config from "../../../resources/Config";
import AddListing from "../AddListings/AddListing";
import ViewListings from "../ViewListings/ViewListings";
import TopBar from "../TopBar/TopBar";
import EditListings from "../AddListings/EditListing";
import MessageControl from "../Messages/MessageControl";

import Profile from "../Profile/Profile";

const { width } = Dimensions.get('screen');
const cardWidth = width / 2 - 20;

const HomeScreen = (props) => {
  const {userDetails, socket } = props;
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [formattedMealArray, setFormattedMealArray] = useState();
  const [screen, setScreen] = useState("Buy")
  const [menuVisible, setMenuVisible] = useState(false)
  const [reviewDetails, setReviewDetails] = useState(null)
  const [userListings, setUserListings] = useState([]);
  const [mealReservationView, setMealReservationView] = useState([]);

  const [reviewMessage, setReviewMessage] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);

  const [userProfileImageBase64, setUserProfileImageBase64] = useState(null);

  const [messageUser, setMessageUser] = useState();
  const [conversationDetails, setConversationDetails] = useState(null);

  const [profileDetails, setProfileDetails] = useState(null);


  const url = Config("url")

  const [itemToEdit, setItemToEdit] = useState();

  const sideBarOptions = [
    { name: "Buy", action: () => sideMenuOptionSelected("Buy"), image: require("../../../assets/bookicon.png"), imageAlt: require("../../../assets/bookiconAlternate.png")},
    { name: "Sell", action: () => sideMenuOptionSelected("Sell"), image: require("../../../assets/sellicon2.png"), imageAlt: require("../../../assets/sellicon2Alternate.png")},
    { name: "Reservations", action: () => sideMenuOptionSelected("Reservations"), image: require("../../../assets/timerIcon.png") , imageAlt: require("../../../assets/timerIconAlternate.png")},
    { name: "Messenger", action: () => sideMenuOptionSelected("Messenger"), image: require("../../../assets/MessageImage.png") , imageAlt: require("../../../assets/MessageImageAlternative.png")},

  ];





  const buyScreen = () => {

    return (
      <ViewListings  messageUserPreparation = {messageUserPreparation} userDetails = {userDetails} socket = {socket} setModalProfileDetails = {setProfileDetails}/>
    );
  };

  const editScreen = () => {

    /*  const {userDetails, itemToEdit, clearEditItem, socket} = props; */
    return (
      <EditListings  userDetails = {userDetails}  itemToEdit = {itemToEdit} clearEditItem = {clearEditItem} socket = {socket}/>
    );
  };

  const clearEditItem = async () => {
    setItemToEdit(null);
    getFromServer("returnOwnMeals", setUserListings);
  }

  const reservationScreen = () => {

    return (
      <View style={{ flex: 1, width:"100%"}}>
        <Text style={{ padding: "5%", fontSize: 28, color:"#c3c3c3" }}>Upcoming reservations</Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          numColumns={2}
          data={formattedMealArray}
          renderItem={({ item }) => <ReservationScreenDisplay food={item} />}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const sellScreen = () => {

    return (

      <View style={{ flex: 1, width:"100%" }}>
          <View style={{ flex: 1, width:"100%"}}>
          <Text style = {{padding: "5%", fontSize:30, textAlign:"left", color:"grey"}}>Your meals</Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            numColumns={2}
            data={userListings}
            renderItem={({ item }) => <SellScreenDisplay food={item} />}
          />
          </View>
          <View style = {{ marginBottom:"10%"}}>
            <TouchableOpacity
              style={{ width: "60%", backgroundColor: "#4f199c", padding: 10, borderRadius: 10, alignItems: "center", alignSelf:"center"}}
              onPress={() => setScreen("AddListing")}
            >
              <Text style={{ fontSize: 20, color: "white", alignSelf:"center" }}>Add Listing</Text>
            </TouchableOpacity>
          </View>
        </View>

    )
  }

  const getFromServer = async (API, storeFunction) =>{
    try {
      const response = await fetch(`${url}/${API}/${userDetails.user_ID}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const allListings = await response.json();

      storeFunction(allListings);
    } catch (error) {
      console.error('Fetch error:', error);

    }

  };




  useEffect(() => {




    getFromServer("returnReservations", setFormattedMealArray);

    getFromServer("returnOwnMeals", setUserListings);

    socket.on("updateListing", getFromServer("returnReservations", setFormattedMealArray));
    socket.on("ChatDetailsReturn", setMessageTo);
    socket.on("returning review",  reviewSelected)
    getProfileImage()
    return () => {
      socket.off("updateListing", getFromServer("returnReservations", setFormattedMealArray));

    };
  }, []);



  useEffect(() =>{

    if (screen == "Sell"){
      getFromServer("returnOwnMeals", setUserListings);
    }else if (screen == "Reservations"){
      getFromServer("returnReservations", setFormattedMealArray);}

  }, [screen]);



  const getProfileImage = async () =>{
    try {
      const response = await fetch(`${url}/returnProfilePicture/${userDetails.user_ID}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseJSON = await response.json();
      setUserProfileImageBase64(responseJSON.base64Data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Handle the error appropriately
    }

  };


  const reviewSelected = (returnedReviewDetails) => {
    if (returnedReviewDetails.exist){
      setReviewDetails(returnedReviewDetails)
      setReviewRating(returnedReviewDetails.review.review_rating)
      setReviewMessage(returnedReviewDetails.review.review_content)
    } else {
      setReviewDetails(returnedReviewDetails)

      console.log("No previous review for this item")
    }
  }

  const setMessageTo = (returnedDetails) => {

    if (returnedDetails){
      setMessageUser(returnedDetails.receiversDetails);
      console.log("returnedDetails", returnedDetails);
      setConversationDetails(returnedDetails.chatDetails.chat_id)
      setScreen("Messenger")
    }
  }




  const displayPreview = () => {
    if (screen == "Buy") { // Assuming "Buy" is at index 0
      return buyScreen();
    } else if (screen == "Sell"){
      if (itemToEdit){
        return editScreen()
      } else{
        return sellScreen()
      }
    }else if (screen == "Reservations"){
      return reservationScreen()
    }else if (screen == "Messenger"){
      return (<MessageControl
        socket={socket}
        userDetails={userDetails}
        messageUser={messageUser}
        setMessageUser={setMessageUser}
        conversationDetails={conversationDetails}
        setConversationDetails={setConversationDetails}
      />);
    } else if (screen == "AddListing"){
      return (<AddListing userDetails={userDetails} setScreen={setScreen} socket={socket} />);
    }
  };

  const changeMenuVisibility = () => {
    setMenuVisible(!menuVisible)
    console.log(menuVisible)
  }


 const sideMenuOptionSelected = (option) => {
    changeMenuVisibility();
    setScreen(option);

 }

  const SideMenuOption = (optionDetails) => {
    console.log(optionDetails, screen)
    return (
      <TouchableOpacity
        style={{
          paddingVertical: screen === optionDetails.optionDetails.name ? "5%" : "3%",
          paddingHorizontal:"5%",
          backgroundColor: screen === optionDetails.optionDetails.name ? "#4f199c" : null,
          justifyContent: "center",
          marginTop: "1%",
          flexDirection: "row",
          margin: "2%",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: screen === optionDetails.optionDetails.name ? "#4f199c" : "white",
        }}
        onPress={optionDetails.optionDetails.action}
      >

        <View style = {{flex:2}}>
          <Image
            source={screen === optionDetails.optionDetails.name ? optionDetails.optionDetails.imageAlt : optionDetails.optionDetails.image}
            style={{ height: 25, width: 25}}
          />
        </View>

        <View style = {{flex:8}}>
          <Text style = {{color: screen === optionDetails.optionDetails.name ? "white" : "#3a3b3c"}}>{optionDetails.optionDetails.name}</Text>
        </View>

      </TouchableOpacity>

    );
  }

  const cardInteract = (operationDictionary) => {
    if (screen == "Sell") {
      setItemToEdit(operationDictionary)
      console.log(operationDictionary)
    } else{
      console.log("else", screen)
    }
  }


  const ReservationScreenDisplay = ({ food }) => {
    return (
      <View activeOpacity={0.9} >
        <View style={style.card}>
          <View style={{ alignItems: 'center', top: -40 }}>
            <Image source={{ uri: `data:image/jpeg;base64,${food.retrievedImage}` }} style={{ height: 120, width: 120, borderRadius:60 }} />
          </View>
          <View style={{ marginHorizontal: 20}}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', top: -20, color:"#c3c3c3" }}>{food.meal.meal_Name}</Text>
          </View>
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress = {() => {messageUserPreparation(food.meal.meal_chef_ID)}}>
              <Text style = {{color:"#c3c3c3"}}>Message</Text>
            </TouchableOpacity>

            {food.meal.meal_status === "CLOSED" ?
              <TouchableOpacity onPress={() => {writeReview(food)}}>
                <Text style = {{color:"#c3c3c3"}}>Review</Text>
              </TouchableOpacity>
            :
            <TouchableOpacity>
              <Text style = {{color:"#c3c3c3"}}>Cancel</Text>
            </TouchableOpacity>}
          </View>
        </View>
      </View>
    );
  };

  const writeReview = (meal_Details) => {
    socket.emit("getReview", userDetails, meal_Details)
  }
  const messageUserPreparation = (toMessageID) => {
    console.log("reserveration message pressed")
    socket.emit("Create Chat", userDetails.user_ID, toMessageID)
  };


  const SellScreenDisplay = ({ food }) => {
    return (
      <View activeOpacity={0.9} >
        <View style={[style.card, {backgroundColor: food.meal.meal_status == "CANCELLED" ? "#c3c3c3" : "white"}]}>
          <View style={{ alignItems: 'center', top: -40 }}>
            <Image source={{ uri: `data:image/jpeg;base64,${food.retrievedImage}` }}
                   style={{ height: 120, width: 120, borderRadius:60 }} />
          </View>
          <View style={{ marginHorizontal: 20, top: - 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color:"grey" }}>{food.meal.meal_Name}</Text>
            <Text style={{ fontSize: 14, color: food.meal.meal_status == "CANCELLED" ? "white" : COLORS.grey, marginTop: 2 }}>
              {formatStatus(food.meal.meal_status)}
            </Text>
          </View>
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress={() => selectReservations(food.meal)}
                              style={{
                                paddingVertical: "2%",
                                backgroundColor: "#d4d4d4",
                                borderRadius: 10,
                                paddingHorizontal: "10%"
                              }}>
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={require('../../../assets/personIcon.png')}
                  style={{ height: 20, width: 20, alignSelf: "center" }}
                />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>
                  {/* Ensure that reservations is an array before trying to access its length */}
                  {food.meal.reservations ? food.meal.reservations.length : 0}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style = {{paddingVertical:"2%", backgroundColor:"#d4d4d4",
                borderRadius:10, paddingHorizontal:"10%"}}

              onPress={() => {
                cardInteract({meal: food.meal, Image: `data:image/jpeg;base64,${food.retrievedImage}`})
              }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Edit
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    );
  };

  const selectReservations = (meal) => {
    console.log(meal.reservations);
    console.log(meal);
    setMealReservationView(meal.reservations);
  }

  const formatStatus = (status) => {
    if (status === "CANCELLED"){
      return "Meal Cancelled"
    }else if (status === "CLOSED"){
      return "No longer available"
    }else if (status === "PREORDER"){
      return "Taking Orders Soon"
    }else if (status === "ORDER"){
      return "Taking orders now"
    }else if (status === "PRESERVE"){
      return "Orders are in!"
    }else if (status === "SERVE"){
      return "Start serving!"
    }
  }




  const changeReviewRating = (rating) => {
    if (reviewRating != rating){
      setReviewRating(rating);
    }
  };

  const closeReviewModal = () => {
    setReviewRating(0);
    setReviewMessage(null);
    setReviewDetails(null);
  };

  const submitReview = () => {
    if (reviewRating > 0 && reviewRating <= 5){
      socket.emit("Submit Review", {meal_ID : reviewDetails.meal.meal.meal_ID, author_id : userDetails.user_ID, review_content : reviewMessage, review_rating:reviewRating})
      closeReviewModal()
    }

  }

  return (
    <View style = {{flex:1, width:"100%"}}>
      {(screen === "Messenger" && messageUser) ? null :
      <View style = {{flex:1}}>
        <TopBar changeMenuVisibility = {changeMenuVisibility} screenUpdate = {setScreen}/>
      </View>}
      <SafeAreaView style={{ flex: 12, backgroundColor: "white", width: "100%" }}>

        <View style = {{flex: 12 ,
          alignItems: 'center',
          width: "100%"}}>
        {displayPreview()}




        </View>
        {profileDetails? <Profile setUserProfileImageBase64 = {setUserProfileImageBase64} userDetails = {userDetails} setMealReservationView={setMealReservationView} profileDetails = {profileDetails} setProfileDetails = {setProfileDetails} messageUserPreparation = {messageUserPreparation} socket = {socket}/> : null}

        <Modal
          visible={reviewDetails ? true : false}
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)'}} onPress={closeReviewModal}/>


            <View  style = {{height:screenHeight/2, width: "80%", backgroundColor:"white",  alignSelf:"center", justifyContent:"center", marginTop:"10%", borderRadius:20}}>


              <View style = {{height:"100%", width: "100%",  flexDirection:"row", paddingHorizontal:"5%", alignContent:"center", justifyContent:"center", borderBottomWidth:1, borderColor: "#d3d3d3"}}>

                <View style = {{alignSelf:"center", width: "100%", alignContent:"center"}}>
                  <Text style = {{margin:"5%", fontSize:28, color:"#c1c1c1", textAlign:"center"}}>Write a review</Text>
                  <View style={{ marginTop:"5%", justifyContent: "center", alignSelf:"center", flexDirection:"row" }}>
                    <View style={{ alignItems: 'center', marginHorizontal:"5%" }}>
                      {reviewDetails?<Image source={{ uri: `data:image/jpeg;base64,${reviewDetails.meal.retrievedImage}` }} style={{ height: 80, width: 80, borderRadius:40 }} />:null}

                    </View>
                    <View style = {{ justifyContent:"space-evenly", flex:1}}>
                      {reviewDetails ?<Text style = {{fontSize:20, textAlign:"center"}}>{reviewDetails.meal.meal.meal_Name}</Text> : null}

                      <View style = {{flexDirection:"row", justifyContent:"space-evenly"}}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <TouchableOpacity key={rating} onPress={() => changeReviewRating(rating)}>
                            <Image
                              source={
                                reviewRating >= rating
                                  ? require('../../../assets/fullStar.png')
                                  : require('../../../assets/emptyStar.png')
                              }
                              style={{ height: 20, width: 20, alignSelf: 'center' }}
                            />
                          </TouchableOpacity>
                        ))}

                    </View>
                    </View>
                  </View>

                  <View style = {{flex:1, width:"90%", backgroundColor:"#ececec", alignSelf:"center", margin:"5%", borderRadius:20}}>
                    <TextInput  placeholder="Enter Review..."
                                placeholderTextColor="black"
                                multiline={true}
                                style={{ flex: 1,
                                  fontSize:18,
                                  paddingLeft :"2%",
                                  height:"100%",
                                  margin:"5%",
                                  textAlignVertical:"top",
                                  color:"black" }}
                                value={reviewMessage}
                                onChangeText={(content) => setReviewMessage(content)}>


                    </TextInput>

                  </View>



                  <View style={{ marginVertical: "5%", alignSelf:"flex-end", justifyContent:"space-evenly", flexDirection:"row", width: "100%"}} >

                    <TouchableOpacity onPress={closeReviewModal}>
                      <Text>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress = {submitReview}>
                      <Text>Submit</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              </View>


            </View>



          </View>

        </Modal>


        <Modal
          visible={mealReservationView.length > 0}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setMealReservationView([])}
        >
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}
              onPress={() => setMealReservationView([])}
            />
            <View style={{
              height: screenHeight / 2,
              width: "80%",
              backgroundColor: "white",
              alignSelf: "center",
              marginTop: "10%",
              borderRadius: 20,
              padding: 20,
            }}>
              <Text style={{ fontSize: 28, color: "#c1c1c1", textAlign: "center", marginBottom: 20 }}>
                Reservations
              </Text>
              <FlatList
                data={mealReservationView}
                renderItem={({ item }) => (
                  <TouchableOpacity  onPress={() => {setProfileDetails(item)}}
                    style={{
                    backgroundColor: "#ececec",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center"
                  }}>
                    {item.userProfileImage ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${item.userProfileImage}` }}
                        style={{ height: 50, width: 50, borderRadius: 25, marginRight: 10 }}
                      />
                    ) : null}
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.user_F_Name} {item.user_L_Name}</Text>
                      <Text style={{ fontSize: 14 }}>Quantity: {item.reservation_Quantity}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                onPress={() => setMealReservationView([])}
                style={{ marginTop: 10, alignSelf: 'flex-end' }}
              >
                <Text>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <Modal
          visible={menuVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setMenuVisible(false)}
        >

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection:"row"}}>
            <View style = {{height: "100%", backgroundColor:"white", flex:8, alignSelf:"flex-start"}}>


              <View style = {{flex:3, flexDirection:"row", paddingHorizontal:"5%", alignContent:"center", justifyContent:"center", borderBottomWidth:1, borderColor: "#d3d3d3"}}>

                <TouchableOpacity onPress={() => {setProfileDetails(userDetails)}}>
                  <View style={{ marginTop:"5%", justifyContent: "center" }}>
                    <Image
                      source={userProfileImageBase64 ? { uri: `data:image/jpeg;base64,${userProfileImageBase64}` } : require('../../../assets/defaultProfile.png')}
                      style={{ height: 100, width: 100, borderRadius: 50}}
                    />
                    <View style = {{flexDirection:"row", justifyContent:"center"}}>
                    <Text style = {{color:"grey"}} >{userDetails.user_F_Name} </Text>
                    <Text style = {{color:"grey"}}>{userDetails.user_L_Name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>




              <View style = {{flex:11, marginTop:"10%"}}>

                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={sideBarOptions}
                  renderItem={({ item }) => <SideMenuOption optionDetails={item} />}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>


            </View>

            <TouchableOpacity style = {{height:"100%", flex:2}} onPress={changeMenuVisibility}>

            </TouchableOpacity>
          </View>

        </Modal>



      </SafeAreaView>
    </View>

  );

};

const style = StyleSheet.create({
  card: {
    height: 220,
    width: cardWidth,
    marginHorizontal: 10,
    marginBottom: 20,
    marginTop: 50,
    borderRadius: 15,
    elevation: 10,
    backgroundColor: COLORS.white,
  }
});

export default HomeScreen;
