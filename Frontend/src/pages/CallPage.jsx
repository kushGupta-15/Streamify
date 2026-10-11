import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, verifyCallAccess } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: callAccess, isLoading: checkingCallAccess, error: callAccessError } = useQuery({
    queryKey: ["callAccess", callId],
    queryFn: () => verifyCallAccess(callId),
    enabled: !!authUser && !!callId,
    retry: false,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser && callAccess?.allowed === true,
  });

  useEffect(() => {
    let callInstance;
    let videoClient;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId || callAccess?.allowed !== true) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (callInstance) {
        callInstance.leave().catch((err) => console.error("Error leaving call:", err));
      }
      if (videoClient) {
        videoClient.disconnectUser().catch((err) => console.error("Error disconnecting video client:", err));
      }
    };
  }, [tokenData, authUser, callId, callAccess]);

  if (checkingCallAccess || isLoading || (isConnecting && !callAccessError && callAccess?.allowed === true)) {
    return <PageLoader />;
  }

  if (callAccessError || callAccess?.allowed === false) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="card bg-base-200 max-w-md p-6 shadow-md">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="opacity-70 mb-4">
            You must be an authorized friend to join this call room.
          </p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;