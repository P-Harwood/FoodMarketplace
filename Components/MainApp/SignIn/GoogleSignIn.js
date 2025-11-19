import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View, Button, Linking, TouchableOpacity } from "react-native";

//import AsyncStorage from '@react-native-async-storage/async-storage';

import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";



const GoogleSignIn = props =>{
  const {setControlEmail, setCurrentPage, socket} = props;

  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

console.log("GoogleSignIN")

/*

  const tryUserAuthenticateToken = async () =>{
    console.log("trying to auto login")
    try {
      const authKey = await AsyncStorage.getItem("Auth Key");
      const user_id = await AsyncStorage.getItem("User ID");
      if (authKey !== null && user_id !== null) {
        console.log("sending autologin", user_id, authKey)
        socket.emit("test Auth", user_id, authKey)
      }else{
        console.log("Auto Login rejected: ",authKey, user_id)
      }
    } catch (error) {
      console.error(`Error returning Authentication Key':`, error);
    }
  }*/



  useEffect(() => {
    console.log("googlesigninpage configuring")
    const configureGoogleSignIn = async () => {
      console.log("configuring")
      await GoogleSignin.configure({
        scopes: ["openid", "profile", "email"],
        webClientId:"735138932089-ui6vc8lropf2i7c5r6c00f7kuimsnogg.apps.googleusercontent.com",
        androidClientId:
          "735138932089-qjiueb31engklljka6s0khne0cedoa6f.apps.googleusercontent.com",
        forceCodeForRefreshToken: true
      });
      console.log("configuring done")
    };
    configureGoogleSignIn();
  }, []);






  const signInWithGoogle = async () => {
    // Function which prompts the user with the Google Sign in Api
    try { // functionality is placed inside a try block to catch errors
      // Load Google play services
      await GoogleSignin.hasPlayServices();

      // Calls google Sign in method and stores its return in a variable
      const userInfo = await GoogleSignin.signIn();

      // Retrieves the idToken from the variable
      const idToken = userInfo.idToken;

      // Logs the returned token in the developed console.
      console.log("Authentication ID Token retrieved:");
      console.log(idToken);

      // Edits the use state variables of the email and id token
      setControlEmail(userInfo.user.email)
      setToken(idToken);

    } catch (error) {// if an error is occured then the code flows into this catch block
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in flow.
        console.log("Sign-in cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign-in) is in progress already.
        console.log("Sign-in operation is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services not available or outdated on the device.
        console.log("Google Play services are not available");
      } else {
        // Some other error occurred.
        console.log("Error occurred while signing in with Google", error);
        console.log("Error occurred while signing in with Google", error.details);
      }
    }
  };



  useEffect(() => {
    if (token) {
      validateIdToken();
      console.log("token validated")
    }
    socket.on("User Not Exist", goToSignUp);
    return () => {
      socket.off("User Not Exist", goToSignUp);
    };
  }, [token]);

  const validateIdToken = async () => {
    try {
      console.log("Vali1")
      const validation = await checkEmail(token, "735138932089-ui6vc8lropf2i7c5r6c00f7kuimsnogg.apps.googleusercontent.com");
      console.log("Vali2")
    } catch (error) {
      console.log("error:", error);
    }
  };
  const checkEmail = async (token, clientID) => {
    socket.emit(
      "checkEmail",
      token,
      clientID
    ); //change when running outside expo
  };

  const goToSignUp = (userDetails) => {
    console.log("GTS",userDetails);
    setCurrentPage("Register")
  };

  return (
    <View style={{flex:1, justifyContent:"center"}}>



      <View style = {{flex:1}}>
        <View style = {{padding:"25%", width:"100%", justifyContent:"center", paddingBottom:"50%"}}>
          <Text style = {{textAlignVertical:"top",fontSize:40, color:"#4f199c", alignSelf:"center"}}>Fresher</Text>
        </View>
        <View style = {{justifyContent:"center", alignItems:"center"}}>
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signInWithGoogle}
          />
        </View>

      </View>


    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:"80%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
export default GoogleSignIn;
