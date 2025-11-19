import { Image, Text, View } from "react-native";
import React from 'react';
import stylesListChats from '../../../../resources/styles/stylesListChats.js';




const ChatLister = (props) => {
    const { chat_user_F_Name, chat_user_L_Name, lastMessage, profilePictureB64 } = props;

    const chatUser = chat_user_F_Name + " " + chat_user_L_Name

    const BoxComponent = ({ chatUser, lastMessage}) => {
        // creates the touchable buttons present in hobbies and modules
        return (

            <View style={stylesListChats.box}>
                {/*box containing the chat appearance*/}


                <View style={stylesListChats.boxInner}>

                    <View style={stylesListChats.iconContainer}>
                      {profilePictureB64 ?
                        <Image
                          source={profilePictureB64 ? { uri: `data:image/jpeg;base64,${profilePictureB64}` } : require('../../../../assets/defaultProfile.png')}
                          style={{ height: "100%",aspectRatio:1, borderRadius: 50}}
                        /> : <Text style={stylesListChats.iconText}>{chat_user_F_Name.charAt(0).toUpperCase()}</Text>
                      }

                    </View>

                </View>

                <View style={[stylesListChats.boxInner, {flexDirection:"column", flex:1}]}>
                    <Text style={[stylesListChats.boxTextContent, {flex:4, textAlign:"left"}]}>{chatUser}</Text>
                </View>
            </View>

        );
    };

    return <BoxComponent chatUser={chatUser} lastMessage={lastMessage} />;
};

export default ChatLister;
