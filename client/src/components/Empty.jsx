import Image from "next/image";
import React from "react";


function Empty() {
  return (
   <div className="border-conversation-border border-1 w-full bg-panel-header-background flex flex-col h-[100vh] border-b-4 border-b-blue-500 items-center justify-center">
          <Image src="/chatapp.gif" alt="chatapp" height={300} width={300}/>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome to ChatApp...</h1>
  </div>
  );
}

export default Empty;
