import React, { useState,useEffect, useRef } from "react";
import ChatList from "./Chatlist/ChatList";
import Chat from "./Chat/Chat";
import Empty from "./Empty";
import { onAuthStateChanged, updateCurrentUser } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { HOST,CHECK_USER_ROUTE,GET_MESSAGES_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";


function Main() {

        const router = useRouter();
        const [{userInfo,currentChatUser,messagesSearch,videoCall,voiceCall,incomingVoiceCall,incomingVideoCall,},dispatch]= useStateProvider();
        const [redirectLogin,setRedirectLogin] = useState(false);
        const [socketEvent,setSocketEvent]= useState(false)
        const socket = useRef();
        useEffect (() => {
          if (redirectLogin) router.push("/login");
          }, [redirectLogin]);

        onAuthStateChanged(firebaseAuth, async(currentUser)=>{
          if (!currentUser) setRedirectLogin(true);
          if (!userInfo && currentUser?.email) {
              const { data } = await axios.post(CHECK_USER_ROUTE, {email: currentUser.email});
              if (!data.status) {
                router.push("/login");
              }
              console.log({data});
              if(data?.data){

                const {id,name,email,profilePicture:profileImage,status}=data.data;
                dispatch({
                  type:reducerCases.SET_USER_INFO,
                  userInfo:{
                    id,
                    name,
                    email,
                    profileImage,
                    status,
                  },
                });
              }
            }
      });

      useEffect(()=>{
         if(userInfo){
          socket.current=io(HOST);
          socket.current.emit("add-user",userInfo.id);
          dispatch({type: reducerCases.SET_SOCKET,socket });
         }
      },[userInfo]);

      useEffect(()=>{
        if(socket.current && !socketEvent) {
      socket.current.on("receive-message", ({ message }) => {
  const isCurrentChat =
    currentChatUser && message.senderId === currentChatUser.id;

  dispatch({
    type: reducerCases.ADD_MESSSAGE,
    newMessage: message,
  });

  // ✅ Update contact preview and unread count if NOT in current chat
  if (!isCurrentChat) {
    dispatch({
      type: reducerCases.INCREMENT_UNREAD_COUNT,
      payload: { contactId: message.senderId },
    });

    dispatch({
      type: reducerCases.UPDATE_CONTACT_LAST_MESSAGE,
      payload: {
        contactId: message.senderId,
        message,
      },
    });
  }
});

socket.current.on("message-status-updated", ({ messageIds, status, contactId }) => {
  dispatch({
    type: reducerCases.UPDATE_MULTIPLE_MESSAGE_STATUSES,
    payload: { messageIds, status },
  });

  if (contactId) {
    dispatch({
      type: reducerCases.UPDATE_CONTACT_UNREAD_COUNT,
      payload: { contactId },
    });
  }
});

          socket.current.on("incoming-voice-call", ({ from, roomId, callType })=>{
           dispatch({
             type: reducerCases.SET_INCOMING_VOICE_CALL,
            incomingVoiceCall: { ...from, roomId, callType },
           });
        });
          socket.current.on("incoming-video-call", ({ from, roomId, callType })=>{
            dispatch({
             type: reducerCases.SET_INCOMING_VIDEO_CALL,
           incomingVideoCall: { ...from, roomId, callType },
          });
          });

          socket.current.on("voice-call-rejected", () => {
            dispatch({
            type: reducerCases. END_CALL,
            });
            });

          socket.current.on("video-call-rejected", () => {
            dispatch({
            type: reducerCases. END_CALL,
            });
            });

            socket.current.on("online-users", ({ onlineUsers }) => {
dispatch({
type: reducerCases.SET_ONLINE_USERS,
onlineUsers,
});
        })

          setSocketEvent(true)
        }
      },[socket.current]);

      useEffect (() => {
        const getMessages = async () => {
          const {data:{messages},} = await axios.get(
            `${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`
          );
          dispatch({type: reducerCases.SET_MESSAGES,messages});
        };
         if (currentChatUser?.id) {
          getMessages();
         }
        }, [currentChatUser]);

  return (
  <> 
     {incomingVideoCall && <IncomingVideoCall/>}
     {incomingVoiceCall && <IncomingCall/>}

     {videoCall && (
      <div className="h-screen w-screen max-h-full overflow-hidden">
        <VideoCall />
      </div>
       ) }

     {voiceCall && (
      <div className="h-screen w-screen max-h-full overflow-hidden">
       <VoiceCall />
      </div>
      ) }
     {!videoCall && !voiceCall && (

      <div className="grid grid-cols-[minmax(280px,30%)_1fr] h-screen w-screen max-h-screen max-w-full overflow-hidden">
  <ChatList />
  {
    currentChatUser ? (
      <div className={messagesSearch ? "grid grid-cols-2" : "grid-cols-1"}>
        <Chat />
        {messagesSearch && <SearchMessages />}
      </div>
    ) : (
      <Empty />
    )
  }
</div>


          )}
  </>
  );
}
export default Main;
