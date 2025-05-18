import React from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import {BsThreeDots} from 'react-icons/bs'
import { FaPlus } from "react-icons/fa6";
import { reducerCases } from "@/context/constants"; 

function ChatListHeader() {
   const [{ userInfo }, dispatch] = useStateProvider();

const handleAllContactsPage = ()=>{
  dispatch({type: reducerCases.SET_ALL_CONTACTS_PAGE});
};

 return (
      <div className=" h-16 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="cursor-pointer">
                <Avatar type="sm" image={userInfo?.profileImage} />
           </div>
           <div className="flex flex-col ">
              <span className="text-primary-strong font-bold">{userInfo?.name}</span>
           </div>
        </div>

             <div className="flex gap-6">
             <FaPlus
                className="text-white panel-header-icon cursor-pointer text-xl "
                title="New Chat"
                onClick={handleAllContactsPage}
              />

            <BsThreeDots
            className="text-white panel-header-icon cursor-pointer text-xl"
            title="Menu"
              />
             </div>
      </div>
   ); 
}
export default ChatListHeader;