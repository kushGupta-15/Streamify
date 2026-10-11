import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareIcon, UserMinusIcon, VideoIcon } from "lucide-react";
import { unfriendUser } from "../lib/api";
import { LANGUAGE_TO_FLAG } from "../constants";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const FriendCard = ({ friend }) => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [isConfirming, setIsConfirming] = useState(false);

  const callId = authUser?._id && friend?._id ? [authUser._id, friend._id].sort().join("-") : null;

  const { mutate: unfriendMutation, isPending } = useMutation({
    mutationFn: () => unfriendUser(friend._id),
    onSuccess: () => {
      toast.success(`Removed ${friend.fullName} from friends`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to remove friend");
    },
  });

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <Link to={`/chat/${friend._id}`} className="btn btn-outline btn-primary btn-sm flex-1">
            <MessageSquareIcon className="size-4 mr-1" />
            Message
          </Link>

          {callId && (
            <Link
              to={`/call/${callId}`}
              className="btn btn-outline btn-success btn-sm btn-square"
              title="Start Video Call"
            >
              <VideoIcon className="size-4" />
            </Link>
          )}

          {isConfirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => unfriendMutation()}
                disabled={isPending}
                className="btn btn-error btn-xs"
                title="Confirm removal"
              >
                {isPending ? "..." : "Remove"}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="btn btn-ghost btn-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirming(true)}
              className="btn btn-ghost btn-sm btn-square text-error opacity-70 hover:opacity-100"
              title="Remove friend"
            >
              <UserMinusIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}