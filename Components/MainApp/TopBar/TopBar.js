import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Keyboard, Image } from 'react-native';
import styles from "../../../resources/styles/styles.js";


const TopBar = (props) => {
  const { changeMenuVisibility, screenUpdate } = props;
  const opacities = [
    { title: 'ViewReservations', key: 'ViewReservations' },
    { title: 'AddListings', key: 'AddListings' },
    { title: 'Settings', key: 'Settings' },
  ];

  const [keyboardMode, setKeyboardMode] = useState(false);

  const _keyboardDidShow = () => {
    setKeyboardMode(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardMode(false);
  };

  useEffect(() => {
    // Add event listeners for keyboard show/hide events
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

  }, []);

  const getImage =(title) => {
    if (title === "AddListings"){
      return(
        <Text>userListings</Text>
      )
    } else if (title === "Settings"){
      return (
        <Text>settings</Text>
      )
    }
    else if (title === "ViewReservations") {
      return (
        <Text>Viewlistings</Text>
      )
    }
  }


  return (
    !keyboardMode && (
      <View style={{ flex: 1, backgroundColor: '#4f199c', width: '100%', paddingLeft:"5%", paddingRight:"5%",flexDirection:"row", alignItems:"center" }}>

          <View style={{flex:1, flexDirection:"row"}}>
            <TouchableOpacity style = {{justifyContent:"center", height:"50%"}} onPress={changeMenuVisibility}>
            <Image
              source={require('../../../assets/menuButton.png')}
              style={{ height: "100%", width: "auto", aspectRatio:1}}
            />
            </TouchableOpacity>
            <View style={{flex:1}}/>
          </View>

          <View style ={ { flex: 2,alignItems: 'flex-start',
            justifyContent: 'center',
            marginHorizontal: 5}}>
            <Text style = {{color:"white", fontSize:25, textAlign:"center"}}>Fresher</Text>
          </View>



      </View>
    )
  );
};


const styles2 = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 100,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    marginHorizontal: 5,
    borderRadius: 10, // Added borderRadius to make the edges curved
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});


export default TopBar;
