import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";

const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });

<style jsx>{`
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>


function ChatContainer() {
const [{ messages, currentChatUser, userInfo, socket }] = useStateProvider();
  const scrollRef = useRef(null);

  const lastMessageRef = useRef(null);

useEffect(() => {
  if (
    messages.length &&
    socket?.current &&
    currentChatUser &&
    userInfo
  ) {
    const unreadMessages = messages.filter(
      (msg) =>
        msg.senderId === currentChatUser.id && msg.messageStatus !== "read"
    );

   if (unreadMessages.length) {
  socket.current.emit("mark-as-read", {
    messageIds: unreadMessages.map((m) => m.id),
    senderId: currentChatUser.id,    // person who sent the unread messages
    receiverId: userInfo.id,         // person who is reading them (you)
  });
}

  }
  
}, [messages, currentChatUser, socket, userInfo]);

// ✅ Add this as a separate useEffect below
useEffect(() => {
  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }
  };

  const timeoutId = setTimeout(() => {
    requestAnimationFrame(scrollToBottom);
  }, 100);

  return () => clearTimeout(timeoutId);
}, [messages]);

  const isImageFile = (fileType) =>
    fileType && fileType.startsWith("image/");

  const isVideoFile = (fileType) =>
    fileType && fileType.startsWith("video/");

  const isPdfFile = (fileType) =>
    fileType && fileType === "application/pdf";

  const isDocFile = (fileType) =>
  fileType === "application/msword" ||
  fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const isExcelFile = (fileType) =>
  fileType === "application/vnd.ms-excel" ||
  fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const isZipFile = (fileType) =>
  fileType === "application/zip" || fileType === "application/x-rar-compressed";


  return (
    <div
      className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar scroll-smooth"
      ref={scrollRef}
    >
      <div className="bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0 pointer-events-none"></div>
      <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto custom-scrollbar"
          >
            {messages.map((message, index) => {
  const isLast = index === messages.length - 1;
  return (
    <div
      key={message.id}
      ref={isLast ? lastMessageRef : null} // ✅ Attach ref to last message
      className={`flex ${
        message.senderId === currentChatUser.id
          ? "justify-start"
          : "justify-end"
      }`}
    >
                {/* Text Message */}
                {message.type === "text" && (
                  <div
                    className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                      message.senderId === currentChatUser.id
                        ? "bg-incoming-background"
                        : "bg-outgoing-background"
                    }`}
                  >
                    <span className="break-all">{message.message}</span>
                    <div className="flex gap-1 items-end">
                      <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                        {calculateTime(message.createdAt)}
                      </span>
                      {message.senderId === userInfo.id && (
                        <MessageStatus messageStatus={message.messageStatus} />
                      )}
                    </div>
                  </div>
                )}
{message.type === "file" && message.fileUrl && (
  <div
    className={`text-white px-2 py-1 text-sm rounded-md flex flex-col gap-2 shadow-md max-w-[60%] ${
      message.senderId === userInfo.id
        ? "bg-outgoing-background"
        : "bg-incoming-background"
    }`}
  >
    {/* Icon + Name + Type */}
    <div className="flex items-start gap-2">
      {/* File Type Icon */}
      {isPdfFile(message.fileType) ? (
  <svg className="w-5 h-5 text-red-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" />
  </svg>
) : isImageFile(message.fileType) ? (
  <svg className="w-5 h-5 text-yellow-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zm-9-5l2.5 3.01L18 13l3 4H6l6-8z" />
  </svg>
) : isVideoFile(message.fileType) ? (
  <svg className="w-5 h-5 text-purple-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 8.64L15.27 12 10 15.36V8.64z" />
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
) : isDocFile(message.fileType) ? (
  <svg className="w-5 h-5 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
  </svg>
) : isExcelFile(message.fileType) ? (
  <svg className="w-5 h-5 text-green-600 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
  </svg>
) : isZipFile(message.fileType) ? (
  <svg className="w-5 h-5 text-orange-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" />
  </svg>
) : (
  <svg className="w-5 h-5 text-gray-300 mt-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" />
  </svg>
)}


      {/* Multiline File Name + Type Label */}
      <div className="flex flex-col w-full">
        <p
          className="text-sm font-semibold break-words whitespace-pre-wrap"
          title={message.fileName || "Untitled File"}
        >
          {message.fileName || "Untitled File"}
        </p>
        <span className="bg-black bg-opacity-10 text-white text-xs w-fit px-2 py-[1px] mt-1 rounded-full">
          {isPdfFile(message.fileType)
            ? "PDF"
            : isImageFile(message.fileType)
            ? "Image"
            : isVideoFile(message.fileType)
            ? "Video"
            : "File"}
        </span>
      </div>
    </div>

    {/* Preview Section */}
{(isImageFile(message.fileType) || isPdfFile(message.fileType) || isVideoFile(message.fileType)) && (
  <>
    {isImageFile(message.fileType) ? (
      <a
        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.fileUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.fileUrl}`}
          alt="preview"
          className="w-full h-auto max-h-52 rounded-md border border-gray-300 object-cover"
        />
      </a>
    ) : isPdfFile(message.fileType) ? (
      <a
        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.fileUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <embed
  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
  type="application/pdf"
  className="w-full rounded-md border border-gray-300"
  style={{ height: "13rem", pointerEvents: "none" }}
/>

      </a>
    ) : isVideoFile(message.fileType) && (
  <div className="w-full">
    <video
      controls
      className="w-full rounded-md border border-gray-300 object-cover"
      style={{
        maxHeight: "13rem",
        minHeight: "10rem",
        backgroundColor: "#000",
      }}
      preload="metadata"
      crossOrigin="anonymous"
    >
      <source
        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.fileUrl}`}
        type={message.fileType}
      />
      Your browser does not support the video tag.
    </video>
  </div>
)}
  </>
)}

    {/* Download + Size + Time + Status */}
    <div className="flex items-center justify-between flex-wrap gap-2">
      <a
        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.fileUrl}`}
        download={message.fileName}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-white text-xs font-semibold px-3 py-1 rounded-md 
          ${message.senderId === userInfo.id
            ? "bg-[#FFA500] hover:bg-[#CD7F32]"
            : "bg-[#6495ED] hover:bg-[#0047AB]"
          }`}
      >
        Download
      </a>

      <div className="flex gap-2 items-center justify-end text-xs text-white ml-auto">
        <span>
          {message.fileSize
            ? message.fileSize >= 1024 * 1024
              ? `${(message.fileSize / (1024 * 1024)).toFixed(2)} MB`
              : `${(message.fileSize / 1024).toFixed(2)} KB`
            : "Unknown size"}
        </span>
        <span className="text-[11px] min-w-fit">{calculateTime(message.createdAt)}</span>
        {message.senderId === userInfo.id && (
          <MessageStatus messageStatus={message.messageStatus} />
        )}
      </div>
    </div>
  </div>
)}

                {/* Image Message (custom handled image) */}
                {message.type === "image" && (
                  <ImageMessage message={message} />
                )}

                {/* Audio Message */}
                {message.type === "audio" && (
                  <VoiceMessage message={message} />
                )}
              </div>
           );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;