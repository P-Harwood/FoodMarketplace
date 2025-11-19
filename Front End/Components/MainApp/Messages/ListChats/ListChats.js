import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
} from "react-native";
import React, {useEffect, useState} from 'react';
import styles from '../../../../resources/styles/styles.js';
import stylesListChats from '../../../../resources/styles/stylesListChats.js';
import ChatLister from "./ChatLister.js"
import Config from '../../../../resources/Config.js';



const url = Config("url");
const ListChats = (props) =>{

    const {socket, setMessageUser,setConversationDetails, userDetails} = props;
    //select function is what to do when a chat is selected

    const [chatSearchValue, setChatSearchValue] = useState('')
    //this is the value which stores the search text used to filter conversations

    const [matchingChats, setMatchingChats] = useState([])
    //matching chats after the said filter

    const [fetchedData, setFetchedData] = useState(null);
    //conversations from server

    const [dataLoading, setDataLoading] = useState(true);
    //dataloading



    useEffect(() => {
        //on component load fetch data
        const fetchDataAsync = async () => {
            const result = await fetchData();
            //sets return from fetchData() as fetchedData
            setFetchedData(result);
            //dataloading true
            setDataLoading(false);
        };

        fetchDataAsync();
    }, []);






    const fetchData = async () => {
        //function to grab data from server
        console.log("UD",userDetails)
        try {
            const response = await fetch(url +'/getConversations/' + userDetails["user_ID"], {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            //grabs data using http request

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            //if the response is fine then format the response and return it
            const json = await response.json();
            console.log(response.status)
            if (response.status === 200){
                return formatReturnedConversations(json);
            } e

        } catch (error) {
            console.error(error);
        }
    };


    //when a chat is pressed the select function passed as a parameter is called with details of the chat user
    const pressChat = (user_F_Name, user_L_Name, conversation_ID , lastMessage, chatWithID) => {
        setConversationDetails(conversation_ID)
        setMessageUser({user_F_Name: user_F_Name, user_L_Name: user_L_Name, user_ID: chatWithID })
    }

    //
    const formatReturnedConversations = (returnedJSON) => {
        console.log("returnedJson")
        const localUserID = userDetails["user_ID"];
        const newArray = [];

        returnedJSON.forEach((conversation) => {
            let talkingToUser;
            //conversation returns details for both users of a conversation
            //this check is needed to determine which person is the local user
            if (conversation["person1_id"] === localUserID){
                talkingToUser = "person2"
            }else{
                talkingToUser = "person1"
            }
            //this adds the conversation to NewArray, formatted correctly
            newArray.push({
                "conversation_ID": conversation["chat_id"],
                "chatWithID": conversation[talkingToUser+"_id"],
                "user_F_Name": conversation[talkingToUser+"_firstname"],
                "user_L_Name":conversation[talkingToUser+"_lastname"],
                "profile_picture":conversation[talkingToUser+"_image"],
                "content": ""
            });

        });
        return newArray;
    };



    const search = (input) => {
        if (input) {
            try {
                if (fetchedData) {
                    const filteredChats = fetchedData.filter((chat) =>
                      `${chat.user_F_Name} ${chat.user_L_Name}`.toLowerCase().includes(input.toLowerCase())
                    );
                    setMatchingChats(filteredChats);
                } else {
                    setMatchingChats([]);
                }
            } catch (error) {
                console.error(error);
                setMatchingChats([]);
            }
        } else {
            setMatchingChats(fetchedData || []); // Handle null or undefined fetchedData
        }
        setChatSearchValue(input);
    };

    const searchControl = () => {
        if (chatSearchValue) {
            return matchingChats || [];
        } else {
            return fetchedData || [];
        }
    };





    if (dataLoading) {
        return (
            <View style={styles.appContainer}>
                <ActivityIndicator size="large" />
            </View>
        )
    }
    return (

        <View style={[stylesListChats.appContainer, { alignItems:"center"}]}>



                <KeyboardAvoidingView behavior='height' style = {{flex: 2, marginTop:"10%"}}>



                    <View style = {{flex: 1, width:"100%"}}>
                        <TextInput
                        value={chatSearchValue}
                        placeholder="Search For Chat..."
                        placeholderTextColor={"grey"}
                        onChangeText={(text) => search(text, setMatchingChats)}
                        style={stylesListChats.textInput}
                                />
                    </View>

                </KeyboardAvoidingView>


                <View style={{ flex: 8 }}>
                    <ScrollView vertical showsHorizontalScrollIndicator={false}>

                        {searchControl().map(({ user_F_Name, user_L_Name, chatWithID, conversation_ID ,  content, profile_picture}) => (
                            <TouchableOpacity
                                key={conversation_ID}
                                style={stylesListChats.chatBoxOptions}
                                onPress={() => pressChat(user_F_Name, user_L_Name, conversation_ID, content, chatWithID)}
                            >
                                <ChatLister chat_user_F_Name = {user_F_Name} chat_user_L_Name = {user_L_Name}  lastMessage = {content} profilePictureB64 = {profile_picture}/>

                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>



        </View>


    );
}

export default ListChats;

