import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsFillEmojiSmileFill } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import {ImAttachment} from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";
import { FaFilePdf, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileWord, FaFileExcel, FaFile } from "react-icons/fa";

const CaptureAudio = dynamic (()=> import("../common/CaptureAudio"),{
  ssr:false,
});

const getFileIcon = (type, name) => {
  if (type.includes("pdf")) return <FaFilePdf className="text-red-500 text-4xl" />;
  if (type.includes("image")) return <FaFileImage className="text-blue-400 text-4xl" />;
  if (type.includes("video")) return <FaFileVideo className="text-purple-400 text-4xl" />;
  if (type.includes("audio")) return <FaFileAudio className="text-green-400 text-4xl" />;
  if (name.endsWith(".zip") || name.endsWith(".rar")) return <FaFileArchive className="text-yellow-400 text-4xl" />;
  if (name.endsWith(".doc") || name.endsWith(".docx")) return <FaFileWord className="text-blue-600 text-4xl" />;
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return <FaFileExcel className="text-green-600 text-4xl" />;
  return <FaFile className="text-white text-4xl" />;
};


function MessageBar() {
   const [{userInfo,currentChatUser,socket},dispatch]=useStateProvider();
   const [message,setMessage]= useState ("")
   const [showEmojiPicker,setShowEmojiPicker]=useState(false)
   const emojiPickerRef=useRef(null);
   const[grabPhoto,setGrabPhoto]=useState(false);
   const [showAudioRecorder,setShowAudioRecorder]= useState(false);
const [selectedFile, setSelectedFile] = useState([]); // multiple files
const [filePreviewUrl, setFilePreviewUrl] = useState([]); // array of file info

   const photoPickerChange =async (e) =>{
     try{
         const file=e.target.files[0];
         const formData = new FormData();
         formData.append("image", file);
         const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData,{
         headers: {
           "Content-Type": "multipart/form-data",
            },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
           },
        }); 
         if(response.status===201)
         {
          socket.current.emit("send-msg",{
            to: currentChatUser?.id,
            from: userInfo?.id,
            message: response.data.message,
         });
         dispatch({
           type: reducerCases.ADD_MESSSAGE,
           newMessage:{
             ...response.data.message,
           },
           fromSelf:true,
         });
         }
       } catch(err) {
        console.log(err);
       }
      };
   
      const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/add-file-message`,

      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      }
    );

    if (response.status === 201) {
      const message = response.data.message;

      // Emit to socket
      socket.current.emit("send-msg", {
        to: currentChatUser.id,
        from: userInfo.id,
        message,
      });

      // Dispatch to state with proper type
      dispatch({
        type: reducerCases.ADD_MESSSAGE,
        newMessage: {
          ...message,         // already contains type: "file"
        },
        fromSelf: true,
      });
    }
  } catch (err) {
    console.log("File upload failed", err);
  }
};

   useEffect(()=>{
     const handleOutsideClick =(event) =>{
      if(event.target.id !== "emoji-open"){
        if(emojiPickerRef.current && 
          !emojiPickerRef.current.contains(event.target)
        ){
            setShowEmojiPicker(false);
        }
      }
     };
     document.addEventListener("click",handleOutsideClick);
     return ()=>{
      document.removeEventListener("click",handleOutsideClick);
     };
   },[]);

   const handleEmojiModal=()=>{

      setShowEmojiPicker(!showEmojiPicker);
   }

   const handleEmojiClick=(emoji)=>{
     setMessage((prevMessage)=>(prevMessage += emoji.emoji));
   }
const getLastBotHistory = (userId = "default") => {
  const all = JSON.parse(localStorage.getItem(`botHistory_${userId}`)) || [];
  return all.slice(-5);
};

const saveBotHistory = (role, content, userId = "default") => {
  const key = `botHistory_${userId}`;
  const history = JSON.parse(localStorage.getItem(key)) || [];
  history.push({ role, content });
  localStorage.setItem(key, JSON.stringify(history.slice(-5)));
};


 const sendMessage = async () => {
  try {
    const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
      to: currentChatUser?.id,
      from: userInfo?.id,
      message,
    });

    socket.current.emit("send-msg", {
      to: currentChatUser?.id,
      from: userInfo?.id,
      message: data.message,
    });

    dispatch({
      type: reducerCases.ADD_MESSSAGE,
      newMessage: {
        ...data.message,
      },
      fromSelf: true,
    });

    setMessage("");

    if (currentChatUser.email === "aibot@gmail.com") {
      // Get last 5 messages for context
      const history = getLastBotHistory(currentChatUser?.id);

      // Save user message in history
      saveBotHistory("user", data.message.message, currentChatUser?.id);

      // Send user message + history to AI backend
     const aiResponse = await axios.post(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/reply`, {
        message: data.message.message,
        userName: userInfo?.name || "User",
        history,
      });

      const botReply = aiResponse.data.reply;

      // Save bot reply in history
      saveBotHistory("bot", botReply, currentChatUser?.id);

      // Save bot reply message in your DB/backend chat message system
      const { data: botData } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: userInfo?.id,
        from: currentChatUser?.id,
        message: botReply,
      });

      socket.current.emit("send-msg", {
        to: userInfo?.id,
        from: currentChatUser?.id,
        message: botData.message,
      });

      dispatch({
        type: reducerCases.ADD_MESSSAGE,
        newMessage: {
          ...botData.message,
        },
        fromSelf: false,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

  useEffect(()=>{
       if(grabPhoto)  {
        const data =document.getElementById("photo-picker");
        data.click();
        document.body.onfocus=(e) =>{
          setTimeout(()=>{
            setGrabPhoto(false);
            
          },1000);
        };
       }
    },[grabPhoto]);
  

  return (
  <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
    {!showAudioRecorder &&(

      <>
    
        <div className="flex gap-6">
            <BsFillEmojiSmileFill
              className="text-white panel-header-icon cursor-pointer text-xl"
              title="Emoji"
              id="emoji-open"
              onClick={handleEmojiModal}
              />
            {showEmojiPicker && (
              <div className="absolute bottom-24 left-16 z-40"
              ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark"/>
               </div>
              )}
            <ImAttachment
              className="text-white panel-header-icon cursor-pointer text-xl"
              title="Attach File"
              onClick={() => document.getElementById("file-picker").click()}
            />

        </div>
        <div className="w-full rounded-lg h-10 flex items-center">
               <input
                type="text"
                placeholder="Let's type a msg"
                className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
                onChange={(e)=>setMessage(e.target.value)}
                value={message}
                />
        </div>
        <div className="flex w-10 items-center justify-center">
        <button >
          {message.length ? (
            <MdSend className=" text-white panel-header-icon cursor-pointer text-xl" 
            onClick={sendMessage}  title="Send message"    
            />
          ) : (
            <FaMicrophone 
            className="text-white panel-header-icon cursor-pointer text-xl"
            title="Record"
            onClick={()=> setShowAudioRecorder(true)}
            />
              )}
        </button>
        </div>
    </>
    )}
    {grabPhoto && <PhotoPicker onChange={photoPickerChange}/>}
    {
      showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder}/>
    }
  <input
  type="file"
  id="file-picker"
  style={{ display: "none" }}
  onChange={(e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setSelectedFile(files); // Now an array
      setFilePreviewUrl(files.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      })));
    }
  }}
  multiple
  accept="*/*"
/>

{selectedFile.length > 0 && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div className={`bg-[#1e2428] text-white p-6 rounded-xl shadow-xl w-full ${
      selectedFile.length === 1 ? "max-w-2xl max-h-[95vh]" : "max-w-3xl max-h-[80vh]"
    } flex flex-col items-center`}>
      
      {selectedFile.length === 1 ? (
  // Single file preview
  <div className="w-full max-h-[70vh] flex flex-col items-center justify-center mb-6">
    <div className="w-full border border-gray-600 p-4 rounded-lg flex flex-col items-center">
      {filePreviewUrl[0].type.startsWith("image/") ? (
        <img src={filePreviewUrl[0].url} alt="preview" className="w-full max-h-[60vh] object-contain rounded-lg" />
      ) : filePreviewUrl[0].type.startsWith("video/") ? (
        <video controls src={filePreviewUrl[0].url} className="w-full max-h-[60vh] object-contain rounded-lg" />
      ) : filePreviewUrl[0].type.startsWith("audio/") ? (
        <audio controls src={filePreviewUrl[0].url} className="w-full" />
      ) : filePreviewUrl[0].type === "application/pdf" ? (
        <embed src={filePreviewUrl[0].url} type="application/pdf" className="w-full h-[50vh] rounded-lg" />
      ) : (
        <div className="flex flex-col items-center">
          {getFileIcon(filePreviewUrl[0].type, filePreviewUrl[0].name)}
        </div>
      )}
      <p className="text-sm mt-2 break-all text-center">
  {filePreviewUrl[0].name} ({(selectedFile[0].size / (1024 * 1024)).toFixed(2)} MB)
</p>
    </div>
  </div>
) : (
  // Multiple files preview
  <div className="w-full overflow-y-auto flex-grow mb-4 scrollbar-hide space-y-6">
    {filePreviewUrl.map((file, index) => (
      <div key={index} className="w-full flex flex-col items-center border border-gray-600 p-4 rounded-lg">
        {file.type.startsWith("image/") ? (
          <img src={file.url} alt="preview" className="w-full max-h-[40vh] object-contain rounded-lg" />
        ) : file.type.startsWith("video/") ? (
          <video controls src={file.url} className="w-full max-h-[40vh] object-contain rounded-lg" />
        ) : file.type.startsWith("audio/") ? (
          <audio controls src={file.url} className="w-full" />
        ) : file.type === "application/pdf" ? (
          <embed src={file.url} type="application/pdf" className="w-full h-[30vh] rounded-lg" />
        ) : (
          <div className="flex flex-col items-center">
            {getFileIcon(file.type, file.name)}
          </div>
        )}
        <p className="text-sm mt-2 break-all text-center">
  {file.name} ({(selectedFile[index].size / (1024 * 1024)).toFixed(2)} MB)
</p>
      </div>
    ))}
  </div>
)}

      <div className="flex gap-6 justify-center">
  <button
    className="bg-[#6495ED] hover:bg-[#0047AB] px-6 py-2 rounded-lg text-sm font-medium"
    onClick={async () => {
      for (const file of selectedFile) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/add-file-message`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              params: { from: userInfo.id, to: currentChatUser.id },
            }
          );

          if (response.status === 201) {
            const message = response.data.message;
            socket.current.emit("send-msg", {
              to: currentChatUser.id,
              from: userInfo.id,
              message,
            });

            dispatch({
              type: reducerCases.ADD_MESSSAGE,
              newMessage: { ...message },
              fromSelf: true,
            });
          }
        } catch (err) {
          console.log("File upload failed", err);
        }
      }
      setSelectedFile([]);
      setFilePreviewUrl([]);
    }}
  >
    {selectedFile.length === 1 ? "Send" : "Send All"}
  </button>

  <button
    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-sm font-medium"
    onClick={() => {
      setSelectedFile([]);
      setFilePreviewUrl([]);
    }}
  >
    Cancel
  </button>
</div>

    </div>
  </div>
)}

  </div>
  );
}

export default MessageBar;