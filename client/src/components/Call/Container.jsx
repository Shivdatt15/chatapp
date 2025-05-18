import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import axios from "axios";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { MdOutlineCallEnd } from "react-icons/md";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const originalGetStats = RTCPeerConnection.prototype.getStats;
RTCPeerConnection.prototype.getStats = function (track) {
  if (!track || track instanceof MediaStreamTrack) {
    return originalGetStats.call(this, track);
  } else {
    console.warn("⚠️ Ignoring invalid getStats argument:", track);
    console.trace();
    return originalGetStats.call(this);
  }
};

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);
  const localAudioRef = useRef(null);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: returnedToken },
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(returnedToken);
      } catch (err) {
        console.log(err);
      }
    };
    if (callAccepted) getToken();
  }, [callAccepted]);

  useEffect(() => {
    const startCall = async () => {
      const zg = new ZegoExpressEngine(
        parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID),
        process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
      );
      setZgVar(zg);

      zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
        if (updateType === "ADD") {
          const rmVideo = document.getElementById("remote-video");
          const vd = document.createElement(data.callType === "video" ? "video" : "audio");
          vd.id = streamList[0].streamID;
          vd.autoplay = true;
          vd.playsInline = true;
          vd.muted = false;
          rmVideo?.appendChild(vd);

          const remoteStream = await zg.startPlayingStream(streamList[0].streamID);
          vd.srcObject = remoteStream;
        } else if (updateType === "DELETE" && zg && streamList[0].streamID) {
          if (localStream) {
            zg.destroyStream(localStream);
          }
          zg.stopPublishingStream(streamList[0].streamID);
          zg.logoutRoom(data.roomId.toString());
          dispatch({ type: reducerCases.END_CALL });
        }
      });

      await zg.loginRoom(
        data.roomId.toString(),
        token,
        { userID: userInfo.id.toString(), userName: userInfo.name },
        { userUpdate: true }
      );

      const stream = await zg.createStream({
        camera: {
          audio: true,
          video: data.callType === "video",
        },
        microphone: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          advancedConstraints: [
            {
              echoCancellation: { ideal: true },
              noiseSuppression: { ideal: true },
              autoGainControl: { ideal: true },
              latency: { ideal: 0 },
              sampleRate: { ideal: 48000 },
              channelCount: { ideal: 2 }
            }
          ]
        },
        constraints: {
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
            sampleRate: 48000,
            channelCount: 2
          },
          video: data.callType === "video"
        }
      });

      if (!stream || stream.getTracks().length === 0) {
        console.error("🚫 Error: No audio/video tracks found in localStream.");
        return;
      }

      if (localAudioRef.current) {
        const videoElement = document.createElement(data.callType === "video" ? "video" : "audio");
        videoElement.id = "video-local-zego";
        videoElement.className = "h-28 w-32";
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        localAudioRef.current.appendChild(videoElement);
        videoElement.srcObject = stream;
      } else {
        console.error("🚫 Error: #local-audio container not found.");
      }

      const streamID = "123" + Date.now();
      setPublishStream(streamID);
      setLocalStream(stream);

      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();

      if (audioTracks.length === 0 && videoTracks.length === 0) {
        console.error("No media tracks available to publish.");
        return;
      }

      zg.startPublishingStream(streamID, stream);
    };

    if (token) {
      startCall();
    }
  }, [token]);

  const endCall = () => {
    const id = data.id;
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }
    const rejectEvent = data.callType === "voice" ? "reject-voice-call" : "reject-video-call";
    socket.current.emit(rejectEvent, { from: id });
    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video" ? "On going call" : "Calling"}
        </span>
      </div>

      {(!callAccepted || data.callType === "audio") && (
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      )}

      <div className="my-5 relative" id="remote-video" />
      <div className="absolute bottom-5 right-5" ref={localAudioRef}></div>

      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd className="text-3xl cursor-pointer" onClick={endCall} />
      </div>
    </div>
  );
}

export default Container;