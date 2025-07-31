import React from "react";
import Avatar from "../common/Avatar";
import { calculateTime } from "@/utils/CalculateTime";
import { useStateProvider } from "@/context/StateContext";
import MessageStatus from "../common/MessageStatus";
import { reducerCases } from "@/context/constants";
import { FaMicrophone, FaCamera } from "react-icons/fa";

function ChatLIstItem({ data, isContactsPage = false }) {
  const [{ userInfo, currentChatUser }, dispatch] = useStateProvider();

  const handleContactClick = () => {
  if (!isContactsPage) {
    const contactId =
      userInfo.id === data.senderId ? data.recieverId : data.senderId;

    // 1. Change the current chat user
    dispatch({
      type: reducerCases.CHANGE_CURRENT_CHAT_USER,
      user: {
        name: data.name,
        about: data.about,
        profilePicture: data.profilePicture,
        email: data.email,
        id: contactId,
      },
    });

    // 2. Optimistically reset unread count to 0
    dispatch({
      type: reducerCases.UPDATE_CONTACT_UNREAD_COUNT,
      payload: { contactId },
    });
  } else {
    dispatch({ type: reducerCases.CHANGE_CURRENT_CHAT_USER, user: { ...data } });
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  }
};


  return (
    <div
      className={`flex cursor-pointer items-center hover:bg-background-default-hover`}
      onClick={handleContactClick}
    >
      <div className="min-w-fit px-5 pt-3 pb-1">
        <Avatar type="lg" image={data?.profilePicture} />
      </div>

      <div className="flex flex-col justify-center mt-3 pr-3 w-full overflow-hidden">
        <div className="flex justify-between items-center w-full">
          <span className="text-white truncate">{data?.name}</span>
          {!isContactsPage && (
            <span
              className={`${
                !data.totalUnreadMessages > 0 ? "text-secondary" : "text-icon-ack"
              } text-xs sm:text-sm whitespace-nowrap ml-2`}
            >
              {calculateTime(data.createdAt)}
            </span>
          )}
        </div>

        <div className="flex border-b border-conversation-border pt-1 pb-2">
          <div className="flex justify-between items-center w-full overflow-hidden">
            <div className="text-secondary text-sm truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]">
              {isContactsPage ? (
                data?.about || "\u00A0"
              ) : (
                <div className="flex items-center gap-1 overflow-hidden truncate">
                  {data.senderId === userInfo.id && (
                    <MessageStatus messageStatus={data.messageStatus} />
                  )}
                  {data.type === "text" && (
                    <span className="truncate">{data.message}</span>
                  )}
                  {data.type === "audio" && (
                    <span className="flex gap-1 items-center">
                      <FaMicrophone className="text-panel-header-icon" /> Audio
                    </span>
                  )}
                  {data.type === "image" && (
                    <span className="flex gap-1 items-center">
                      <FaCamera className="text-panel-header-icon" /> Image
                    </span>
                  )}
                </div>
              )}
            </div>

            {data.totalUnreadMessages > 0 && (
              <span className="bg-icon-ack text-white text-xs sm:text-sm px-[6px] ml-2 rounded-full min-w-[20px] text-center">
                {data.totalUnreadMessages}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatLIstItem;
