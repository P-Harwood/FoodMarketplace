import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Keyboard, Image } from 'react-native';
import styles from "../../../resources/styles/styles";


const BottomBar = (props) => {
    const { screenUpdate } = props;
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
            <View style={[styles.view, { flex: 1, backgroundColor: '#4f199c', width: '100%' }]}>
                <View style={styles2.container}>
                    {opacities.map(({ title, key }) => (
                        <TouchableOpacity key={key} style={styles2.button} onPress={() => screenUpdate(key)}>
                            {getImage(title)}
                        </TouchableOpacity>
                    ))}
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


export default BottomBar;
