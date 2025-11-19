import { Dimensions, StyleSheet } from "react-native";


const stylesImages = StyleSheet.create({

    imageBox: {
        padding:1,
        backgroundColor: "#e5e5e5",
        borderRadius:1,
    },
    BoxContent: {
        flex: 7,
        alignItems: "stretch",
    },
    box:{
        alignItems:"center",
        borderRadius:10,
        borderWidth:1,
        padding:10,
    },
    title: {
        fontSize:32,
      color:"black"
    },

    textInput: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#d6e6cf",
        height: 50,
        marginBottom: "5%",
        alignItems: "stretch",
        color: "black",
        borderRadius: 5,

    },
    boxTextContent: {
        fontSize: 15,
        color: 'white',
    },
    chatBoxOptions:{
        borderRadius:10,
        borderWidth:1,
        borderColor:"#d6e6cf",
        backgroundColor:"#d6e6cf",
        marginBottom:1,
        marginRight:20,
        justifyContent: 'center',
        alignItems: 'stretch' },


});
export default stylesImages;
