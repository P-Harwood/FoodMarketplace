import {Dimensions, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    appContainer: {

        backgroundColor: '#f9f9f9',
        //alignItems: 'center',
        flexDirection: "column",
        justifyContent: 'center',
        width: Dimensions.get('window').width,
        height: "100%",
        alignItems:"center",
    },
    text: {
        fontSize: 20,
        color: "white",
    },
    view: {
        alignItems: 'center',
        justifyContent: "center",
    },
    image: {
        width: 100,
        height: 100,
    },
    textInput: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "black",
        width: '80%',
        height: 50,
        marginBottom: "5%",
        alignItems: "stretch",
        color: "#240090",
        borderRadius: 5

    }
    ,


});
export default styles;
