import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, verifyChatAccess } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { VideoIcon } from "lucide-react";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);

  const { authUser } = useAuthUser();

  const { data: accessData, isLoading: checkingAccess, error: accessError } = useQuery({
    queryKey: ["chatAccess", targetUserId],
    queryFn: () => verifyChatAccess(targetUserId),
    enabled: !!authUser && !!targetUserId,
    retry: false,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser && accessData?.allowed === true,
  });

  useEffect(() => {
    let client;

    const initChat = async () => {
      if (!tokenData?.token || !authUser || accessData?.allowed !== true) return;

      try {
        console.log("Initializing stream chat client...");

        client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        // Listen for incoming call notifications from partner
        const handleNewMessage = (event) => {
          if (
            event.message &&
            event.message.user?.id !== authUser._id &&
            (event.message.isCallInvite || event.message.text?.includes("/call/"))
          ) {
            setIncomingCall({
              callerName: event.message.user?.name || "Partner",
              callId: currChannel.id,
            });
          }
        };

        currChannel.on("message.new", handleNewMessage);

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (client) {
        client.disconnectUser().catch((err) => console.error("Error disconnecting chat client:", err));
      }
    };
  }, [tokenData, authUser, targetUserId, accessData]);

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      try {
        await channel.sendMessage({
          text: `I've started a video call. Join here: ${callUrl}`,
          isCallInvite: true,
        });

        toast.success("Joining call room...");
        navigate(`/call/${channel.id}`);
      } catch (err) {
        console.error("Error sending call invitation:", err);
        navigate(`/call/${channel.id}`);
      }
    }
  };

  if (checkingAccess) return <ChatLoader />;

  if (accessError || accessData?.allowed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
        <div className="card bg-base-200 max-w-md p-6 shadow-md">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="opacity-70 mb-4">
            You must be connected as friends with this user to start a conversation or video call.
          </p>
          <Link to="/friends" className="btn btn-primary">
            Back to Friends
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] relative">
      {/* INCOMING CALL NOTIFICATION MODAL BANNER */}
      {incomingCall && (
        <div className="absolute top-2 left-4 right-4 max-w-md mx-auto z-50 alert alert-info shadow-xl flex justify-between items-center animate-bounce">
          <div className="flex items-center gap-2">
            <VideoIcon className="size-5 text-primary" />
            <div>
              <p className="font-bold text-sm">Incoming Video Call</p>
              <p className="text-xs">{incomingCall.callerName} started a call</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/call/${incomingCall.callId}`)}
              className="btn btn-success btn-xs text-white"
            >
              Join Call
            </button>
            <button
              onClick={() => setIncomingCall(null)}
              className="btn btn-ghost btn-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;