import { Socket } from "socket.io-client";
import { reducerCases } from "./constants";

export const initialState ={
    userInfo: undefined,
    newUser:false,
    contactsPage: false,
    currentChatUser:undefined,
    messages:[],
    Socket:undefined,
    messagesSearch:false,
    userContacts :[],
    onlineUsers:[],
    filteredContacts:[],
    videoCall: undefined,
    voiceCall: undefined,
    incomingVoiceCall: undefined,
    incomingVideoCall: undefined,
};

const reducer =(state,action)=>{
    switch (action.type){
        case reducerCases.SET_USER_INFO:
                return {
                    ...state,
                    userInfo:action.userInfo,
                };
            
        case reducerCases.SET_NEW_USER:
            return {
                ...state,
                newUser:action.newUser,
            };
            case reducerCases.SET_ALL_CONTACTS_PAGE:
              return {
                 ... state,
                 contactsPage: !state.contactsPage,
              };  
             case reducerCases.CHANGE_CURRENT_CHAT_USER:
                return{
                    ...state,
                    currentChatUser: action.user,
                }; 

                case reducerCases.SET_MESSAGES:
                    return{
                        ...state,
                        messages:action.messages,
                    };
                    case reducerCases.SET_SOCKET:
                        return{
                            ...state,
                            socket:action.socket,
                        };    
                        case reducerCases.ADD_MESSSAGE:
                            return{
                                ...state,
                                messages:[...state.messages,action.newMessage],
                            };           
                            case reducerCases.SET_MESSAGE_SEARCH:
                                return {
                                ... state,
                                messagesSearch: !state.messagesSearch,
                                };  
            
                                case reducerCases.SET_USER_CONTACTS:
                                    return {
                                    ... state,
                                    userContacts: action.userContacts,
                                    };
                                    case reducerCases.SET_ONLINE_USERS:
                                    return {
                                    ... state,
                                    onlineUsers: action.onlineUsers,
                                    };      
                                    case reducerCases.SET_CONTACT_SEARCH: {
                                        const filteredContacts = state.userContacts.filter((contact) =>
                                        contact.name.toLowerCase().includes (action.contactSearch.toLowerCase())
                                        );
                                        return {
                                        ... state,
                                        contactSearch: action.contactSearch,
                                        filteredContacts,
                                        };
                                        }  
                                        case reducerCases.SET_VIDEO_CALL:
                                            return {
                                            ... state,
                                            videoCall: action.videoCall,
                                            };
                                            case reducerCases.SET_VOICE_CALL:
                                            return {
                                            ... state,
                                            voiceCall: action. voiceCall,
                                            };
                                            case reducerCases.SET_INCOMING_VOICE_CALL:
                                            return {
                                            ... state,
                                            incomingVoiceCall: action.incomingVoiceCall,
                                            };
                                            case reducerCases.SET_INCOMING_VIDEO_CALL:
                                            return {
                                            ... state,
                                            incomingVideoCall: action.incomingVideoCall,  
                                            };  
                                            case reducerCases. END_CALL:
                                              return {
                                              ... state,
                                              voiceCall: undefined,
                                              videoCall: undefined,
                                              incomingVideoCall: undefined,
                                              incomingVoiceCall: undefined,
                                              };  
                                              case reducerCases.UPDATE_MULTIPLE_MESSAGE_STATUSES:
  return {
    ...state,
    messages: state.messages.map((msg) =>
      action.payload.messageIds.includes(msg.id)
        ? { ...msg, messageStatus: action.payload.status }
        : msg
    ),
  };
  case reducerCases.UPDATE_CONTACT_UNREAD_COUNT:
  return {
    ...state,
    userContacts: state.userContacts.map((contact) =>
      contact.id === action.payload.contactId
        ? { ...contact, totalUnreadMessages: 0 }
        : contact
    ),
  };

  case reducerCases.INCREMENT_UNREAD_COUNT:
  return {
    ...state,
    userContacts: state.userContacts.map((contact) =>
      contact.id === action.payload.contactId
        ? {
            ...contact,
            totalUnreadMessages: contact.totalUnreadMessages + 1,
          }
        : contact
    ),
  };
 
  case reducerCases.UPDATE_CONTACT_LAST_MESSAGE:
  return {
    ...state,
    userContacts: state.userContacts.map((contact) =>
      contact.id === action.payload.contactId
        ? {
            ...contact,
            message: action.payload.message.message,
            type: action.payload.message.type,
            messageStatus: action.payload.message.messageStatus,
            createdAt: action.payload.message.createdAt,
            senderId: action.payload.message.senderId,
            recieverId: action.payload.message.recieverId,
            messageId: action.payload.message.id,
          }
        : contact
    ),
  };

                                              
                                              case reducerCases.SET_EXIT_CHAT:
                                                return {
                                                    ...state,
                                                    currentChatUser:undefined,
                                                };
                        
        default:
            return state;
    }
};

export default reducer;