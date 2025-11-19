import { SafeAreaView, View } from "react-native";
import React, { useEffect, useState } from "react";

import ListChats from "./ListChats/ListChats.js"
import MessageUser from "./OpenChat/MessageUser.js"

const MessageControl = (props) =>{

    const {userDetails, socket, messageUser, setMessageUser, conversationDetails, setConversationDetails} = props;



    useEffect(() => {
        const findConversation = async () => {
            try {
                const response = await fetch(`${url}/getConversationID/${userDetails.user_ID}/${messageUser.user_ID}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const conversationDetails = await response.json();
                setConversationDetails(conversationDetails);
            } catch (error) {
                console.error('Fetch error:', error);

            }
        }
        if (messageUser && !conversationDetails){
            findConversation()
        }
    }, [messageUser]);


    const resetConversation = () => {
        setConversationDetails(null);
        setMessageUser(null);
    }


    return (

        <SafeAreaView>
            {messageUser? <MessageUser socket = {socket} userDetails = {userDetails} onBackButton={() => resetConversation()} chattingTo = {messageUser} conversationDetails = {conversationDetails}/>
              : <ListChats socket = {socket} setMessageUser ={setMessageUser} setConversationDetails = {setConversationDetails} userDetails = {userDetails}/>}


        </SafeAreaView>

    );
}
export default MessageControl;
