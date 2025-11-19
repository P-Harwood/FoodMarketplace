import {
    Text,
    View,
    BackHandler,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    FlatList,
    SafeAreaView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Dimensions,
} from "react-native";
import React, { useEffect, useState } from 'react';
import stylesOpenChats from '../../../../resources/styles/stylesOpenChats.js';
import Conversation from "./Conversation.js"
import styles from "../../../../resources/styles/styles";


import { MMKV } from 'react-native-mmkv'
import Config from "../../../../resources/Config";
const { height } = Dimensions.get('screen');
const MessageUser = (props) => {
    const storage = new MMKV();
    const url = Config("url")

    //gets parameters
    const { onBackButton,  userDetails, socket, conversationDetails, chattingTo } = props;
    console.log("message User", chattingTo)
    console.log("message User", conversationDetails)
    //text value is what is inside the text messager box
    const [textValue, setTextValue] = useState("");

    //fetched data is the data obtained from the server
    const [fetchedData, setFetchedData] = useState(null);

    //dataloading is a boolean to know if data has been fetched yet
    const [dataLoading, setDataLoading] = useState(true);


    //back button detector
    const backButtonPress = () => {
        onBackButton()
        storage.clearAll()

        // Do something when back button is pressed
    };

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backButtonPress
    );

    /*
    useEffect(() => {
        const clearAsyncStorage = async () => {
            await AsyncStorage.clear();
            console.log('Storage successfully cleared!');
        }
        clearAsyncStorage();
    }, []);
*/

    //on changes to chattingTo or socket
    useEffect(() => {
        //asks the server for conversation from the last message
        const fetchDataAsync = async () => {
            socket.emit('checkConversation', conversationDetails, await getLastMessage());
        };
        const update = async (newMessages) => {
            storeNewMessages(newMessages)
          }

        fetchDataAsync();

        const storeNewMessages = (newMessages) => {
            console.log("nm", newMessages);
            storeConversation(newMessages);
            setDataLoading(false);
        };

        //turns on listener for new messages and sends its params to storenewmessages
        socket.on('New Messages',storeNewMessages );

        return () => {
            //switches off listener
            socket.off('New Messages', storeNewMessages);
        };
    }, [chattingTo, socket]);

    async function onSendButtonPress() {
        //when new message is sent trim it and format the messages
        console.log(chattingTo);
        console.log("CD",conversationDetails);
        if (textValue.trim()) {
            const message = {
                conversationID: conversationDetails,
                sender_id: userDetails["user_ID"],
                message: textValue,
                recipientId: chattingTo.user_ID,
            };
            //send the message to the server + the last message id
            socket.emit('sendMessage', message, await getLastMessage());
            //resets the text box
            setTextValue("");
        }
    }

    const storeConversation = async (newData) => {
        const storageKey = 'conversation' + conversationDetails;
        const existingData = storage.getString(storageKey);
        const data = existingData ? JSON.parse(existingData) : [];
        let updatedData = data.length > 0 ? [...data, ...newData] : newData;
        console.log("combined:", updatedData);

        storage.set(storageKey, JSON.stringify(updatedData)); // Store updated data

        setFetchedData([...updatedData].reverse()); // Reverse and set fetched data

    };

    const getLastMessage = () => {
        const storageKey = 'conversation' + conversationDetails;
        const existingData = storage.getString(storageKey);
        const data = existingData ? JSON.parse(existingData) : [];

        // Sort the array based on the sent_at timestamp in descending order
        const sortedData = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

        console.log("sorted messages:", sortedData);

        // Get the message_id of the latest message (if any)
        const latestMessage = sortedData.length > 0 ? sortedData[0]?.message_id || 0 : 0;
        console.log("latestMessage:", latestMessage);
        return latestMessage;
    };

    if (dataLoading) {
        //if the data is still being grabbed then just return a loading box
        return (
            <View style={[styles.appContainer, { backgroundColor: "#d6e6cf" }]}>
                <ActivityIndicator size="large" />
            </View>
        )
    }



    return (

        <SafeAreaView style = {{flex:1, width:"100%"}}>

        <View style={{ backgroundColor: "white", flex: 1, width: "100%" }}>
            {/*Top bar which contains back button and the name of person talking to*/}
            <KeyboardAvoidingView behavior='height' style={stylesOpenChats.topBarChatDetails}>
                <TouchableOpacity style = {{flex:1, justifyContent:"center"}} onPress={onBackButton}>
                    <Text style = {{marginLeft:"20%", color:"white"}}>Back</Text>
                </TouchableOpacity>
                <Text style={[stylesOpenChats.text, {flex:2, textAlign:"left", color:"white"}]}>{chattingTo.user_F_Name} {chattingTo.user_L_Name}</Text>

            </KeyboardAvoidingView>


            <View style={stylesOpenChats.messageLogContainer}>
                {/*flat list is used here due to the essiential word
                        inverted which allows last messages to appear at the bottom of the screen

                        fetcheddata is the data fetched from async storage and server
                        */}
            {fetchedData && fetchedData.length != 0 && (


                    <FlatList

                        inverted
                        data={fetchedData}
                        keyExtractor={(item) => item["message_id"].toString()}

                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={stylesOpenChats.chatBoxOptions}
                                key={item["message_id"]}
                            >
                                <Conversation
                                    localUserID={userDetails["user_ID"]}
                                    messageDetails={{
                                        messageID: item["message_id"],
                                        sender_id: item["sender_id"],
                                        message: item["content"],
                                        sent_at: item["sent_at"],
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    />

            )}
            </View>
            <KeyboardAvoidingView behavior='height' style={{ flex: 1, flexDirection: 'row' }}>
                <TextInput
                    placeholder="Enter Message..."
                    placeholderTextColor="black"

                    style={stylesOpenChats.sendInputBox}
                    value={textValue}
                    onChangeText={text => setTextValue(text)}
                />
                <TouchableOpacity style={[stylesOpenChats.sendMessageBox, {justifyContent:"center"}]} onPress={onSendButtonPress}>
                    <Text style={{ color: 'black', fontSize: 20,  }}>Send</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>

        </View>

        </SafeAreaView>

    );
}

export default MessageUser;
