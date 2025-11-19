import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Dimensions, FlatList,
} from "react-native";
import React, {useState, useEffect} from 'react';
import styles from '../../../resources/styles/styles.js';
import stylesProfile from "../../../resources/styles/stylesProfile.js"
import stylesViewListings from "../../../resources/styles/stylesViewListings";
import Config from "../../../resources/Config";
import COLORS from "../../consts/colors";

import ImagePicker from 'react-native-image-crop-picker';

const Profile = (props) => {
  const {userDetails , setUserProfileImageBase64, setMealReservationView, setProfileDetails, profileDetails, messageUserPreparation, socket} = props;
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const url = Config("url")
  const [profileMeals, setProfileMeals] = useState(null);
  const [profileReviews, setProfileReviews] = useState(null);

  const [profileImage, setProfileImage] = useState(null)
  const [profileImageBase64, setProfilePictureBase64] = useState(null)

  const [viewMode, setViewMode] = useState("meals")
  const [hallName, setHallName] = useState("meals")
  const closeProfileModal= () => {
    setProfileDetails(null);
  }

  const getMealsReviewsFromServer = async () =>{
    try {
      const response = await fetch(`${url}/returnMealsReviews/${profileDetails.user_ID}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const allListings = await response.json();
      console.log("reviews", allListings.reviews)
      setProfileMeals(allListings.meals);
      setProfileReviews(allListings.reviews);
    } catch (error) {
      console.error('Fetch error:', error);

    }

  };


  const MealsDisplay = ({ food }) => {
    return (
        <View style={{

          width: "95%",
          alignSelf:"center",
          paddingHorizontal: "2%",
          borderRadius: 10,
          paddingVertical:"1%",
          elevation: 10,
          marginVertical:"2%",
          backgroundColor: COLORS.white,
          flexDirection:"row"
        }}>
          <View style={{ alignItems: 'center', flex:1, marginLeft:"5%", justifyContent:"center"}}>
            <Image source={{ uri: `data:image/jpeg;base64,${food.retrievedImage}` }} style={{ height: 50, aspectRatio:1, borderRadius:15 }} />
          </View>
          <View style={{ marginHorizontal: 20, flex:2}}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color:"#c3c3c3" }}>{food.meal_Name}</Text>
          </View>
        </View>
    );
  };
  const ReviewsDisplay = ({ review }) => {
    return (
        <View style={{

          width: "95%",
          alignSelf:"center",
          paddingHorizontal: "2%",
          borderRadius: 10,
          paddingVertical:"1%",
          elevation: 10,
          marginVertical:"2%",
          backgroundColor: COLORS.white,
          flexDirection:"row"
        }}>
          <View style={{ alignItems: 'center', flex:1, marginLeft:"5%", justifyContent:"center"}}>
            <Image
              source={require('../../../assets/fullStar.png')}
              style={{ height: 20, width: 20, alignSelf: 'center' }}
            />
            <Text>{review.review_rating}</Text>
          </View>
          <View style={{ marginHorizontal: 20, flex:2}}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color:"#c3c3c3" }}>{review.user_F_Name} {review.user_L_Name}</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color:"#c3c3c3" }}>{review.review_content}</Text>
          </View>
        </View>
    );
  };
  const imageSelector = () => {




    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true
    }).then(image => {
      console.log(image);
      console.log(image.path);
      setProfileImage(image.path)
    }).catch(error => {
      console.log("RN-I-C-P Error", error)
    });

  };

  useEffect(() => {
    if (profileImage){
      profileImagePress(profileImage);

    }
  },[profileImage]);



  useEffect(() => {
    console.log(userDetails.user_ID == profileDetails.user_ID )
    console.log(userDetails.user_ID, profileDetails.user_ID )
    const getProfileImage = async () =>{
      try {
        const response = await fetch(`${url}/returnProfilePicture/${profileDetails.user_ID}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseJSON = await response.json();
        setProfilePictureBase64(responseJSON.base64Data);
        if (userDetails.user_ID === profileDetails.user_ID){
          setUserProfileImageBase64(responseJSON.base64Data)
        }

      } catch (error) {
        console.error('Fetch error:', error);
        // Handle the error appropriately
      }

    };
    socket.emit("getAccommodationName", profileDetails.halls_ID)
    socket.on("returnHallName", setHallName)

    getMealsReviewsFromServer()

    getProfileImage();
    return () => {
      socket.off("returnHallName", setHallName)
    }

  }, []);




  const messageSelected = () =>{
    console.log("profile Details", profileDetails)
    messageUserPreparation(profileDetails.user_ID)
    setProfileDetails(null);
    setMealReservationView([]);
  }



  const profileImagePress = async (imageUri) =>{
    if (userDetails.user_ID = profileDetails.user_ID){
      console.log("changing profile image")


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
        const response = await fetch(`${url}/uploadProfileImage/${userDetails.user_ID}`, {
          method: 'POST',
          body: formData
        });

        //if the response is 200 (everything is alright) then return server path
        const status =  response.status;
        const responseJSON = await response.json()
        if (status === 200) {
          setProfilePictureBase64(responseJSON.base64Data);
          setUserProfileImageBase64(responseJSON.base64Data)
          setProfileImage(null);
        } else {
          console.error(`Error uploading image. Status code: ${status}`);
        }
      } catch (error) {
        console.error("error", error);
      }
    }


  }

  return (
    <Modal
      visible={profileDetails ? true : false}
      animationType="none"
      transparent={true}
      onRequestClose={closeProfileModal}
    >

      <View style={{ flex: 1, width: "100%", alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>


        <TouchableOpacity style = {{position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height:"100%",
          backgroundColor: 'rgba(0, 0, 0, 0.5)'}} onPress={closeProfileModal}/>


        <View  style = {{height:screenHeight/1.5, width: "80%", backgroundColor:"white",  alignSelf:"center", justifyContent:"center", marginTop:"10%", borderRadius:20, padding:"10%"}}>


          <View style={{width:"100%", flex:5,  justifyContent: "center", flexDirection:"row", marginBottom:"5%" }}>
            <TouchableOpacity onPress = {() => {userDetails.user_ID == profileDetails.user_ID ? imageSelector() : null}}>

            <Image
              source={profileImageBase64 ? { uri: `data:image/jpeg;base64,${profileImageBase64}` } : require('../../../assets/defaultProfile.png')}
              style={{ height: 100, width: 100, borderRadius: 50}}
            />
            </TouchableOpacity>
            <View style = {{justifyContent:"flex-start", marginVertical:"10%", marginHorizontal:"5%",}}>
              <View style = {{flexDirection:"row", justifyContent:"flex-start",  alignSelf:"flex-start", marginBottom:"2%"}}>
                <Text style = {{fontSize:20, color:"#c3c3c3"}}>{profileDetails.user_F_Name} </Text>
                <Text style = {{fontSize:20, color:"#c3c3c3"}}>{profileDetails.user_L_Name}</Text>
              </View>
              <Text style = {{fontSize:15, color:"#c4c4c4", marginLeft:"5%"}}>{hallName}</Text>
            </View>
          </View>


          <View style = {{width:"100%", backgroundColor:"white", flex:10,  borderColor:"black", elevation:10, borderRadius:10}}>
            <View style = {{width:"100%", flexDirection:"row"}}>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: viewMode === "meals" ? "#4f199c" : "#e5d8f9",
                borderTopLeftRadius: 10,
                borderRightWidth: 1,
                borderColor: "#c3c3c3",
              }} onPress={() => {setViewMode("meals")}}>


                <Text style = {{
                  fontSize:20,
                  textAlign:"center",
                  color: viewMode === "meals" ? "white" : "black"}}>Meals</Text>


              </TouchableOpacity>
              <TouchableOpacity style = {{flex:1, backgroundColor: viewMode === "reviews" ? "#4f199c" : "#e5d8f9", borderTopRightRadius:10}} onPress={() => {setViewMode("reviews")}}>
                <Text style = {{fontSize:20, textAlign:"center", color: viewMode === "reviews" ? "white" : "black"}}>Reviews</Text>
              </TouchableOpacity>
            </View>
            <View style = {{flex:1, backgroundColor:"#b289ec", borderBottomLeftRadius:10, borderBottomRightRadius:10}}>
              <FlatList
                showsVerticalScrollIndicator={false}
                numColumns={1}
                data={viewMode === "meals" ? profileMeals : profileReviews}
                renderItem={({ item }) => {
                  return viewMode === "meals" ? <MealsDisplay food={item} /> : <ReviewsDisplay review={item} />;
                }}
                keyExtractor={(item, index) => index.toString()}
                style={{ flex: 1, paddingVertical: "5%" }}
              />
            </View>

          </View>



          <View style = {{flex:2, width:"100%",  justifyContent:"space-around", flexDirection:"row", alignItems:"flex-end"}}>
            <TouchableOpacity onPress={closeProfileModal}>
              <Text style = {{color:"#c3c3c3"}}>Back</Text>
            </TouchableOpacity>
            {userDetails.user_ID == profileDetails.user_ID ? null :
              <TouchableOpacity onPress = {() => (messageSelected(profileDetails))}>
                <Text style = {{color:"#c3c3c3"}}>Message</Text>
              </TouchableOpacity>
            }


          </View>

          </View>



        </View>



    </Modal>
  );
}
export default Profile;
const styles2 = StyleSheet.create({
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
    borderRadius: 35, // half of width and height to create a circle
    backgroundColor: '#E4E4E4', // specify background color for the circle
    marginRight:"5%",
    alignSelf:"flex-start",
    marginTop:"1%",
    marginBottom:"5%"
  }
});
