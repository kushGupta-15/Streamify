import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  cancelFriendRequest,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  FilterIcon,
  MapPinIcon,
  RotateCcwIcon,
  SearchIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { capitialize } from "../lib/utils";
import { LANGUAGES } from "../constants";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsMap, setOutgoingRequestsMap] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedMatchType, setSelectedMatchType] = useState("all");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", searchTerm, selectedLanguage, selectedMatchType],
    queryFn: () =>
      getRecommendedUsers({
        search: searchTerm,
        language: selectedLanguage,
        matchType: selectedMatchType,
      }),
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending: isSending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send request");
    },
  });

  const { mutate: cancelRequestMutation, isPending: isCancelling } = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      toast.success("Friend request cancelled");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel request");
    },
  });

  useEffect(() => {
    const outgoingMap = new Map();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        if (req.recipient?._id) {
          outgoingMap.set(req.recipient._id, req._id);
        }
      });
    }
    setOutgoingRequestsMap(outgoingMap);
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover high-compatibility language partners ranked by reciprocal skills
                </p>
              </div>

              {(searchTerm || selectedLanguage !== "all" || selectedMatchType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLanguage("all");
                    setSelectedMatchType("all");
                  }}
                  className="btn btn-ghost btn-sm text-xs gap-1"
                >
                  <RotateCcwIcon className="size-3.5" />
                  Reset Filters
                </button>
              )}
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div className="bg-base-200 p-4 rounded-xl shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* SEARCH INPUT */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search by name, bio, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-sm w-full pl-9"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* LANGUAGE SELECT */}
                <div className="relative">
                  <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="select select-bordered select-sm w-full pl-9"
                  >
                    <option value="all">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MATCH TYPE FILTER */}
                <div>
                  <select
                    value={selectedMatchType}
                    onChange={(e) => setSelectedMatchType(e.target.value)}
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="all">All Match Types</option>
                    <option value="perfect">⭐ Perfect Exchanges (100%)</option>
                    <option value="native">🎯 Native Speakers (75%)</option>
                    <option value="study">📚 Study Partners (50%)</option>
                  </select>
                </div>
              </div>

              {/* QUICK PILLS */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-semibold opacity-60 mr-1">Quick Filters:</span>
                <button
                  onClick={() => setSelectedMatchType("all")}
                  className={`btn btn-xs rounded-full ${
                    selectedMatchType === "all" ? "btn-neutral" : "btn-ghost"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedMatchType("perfect")}
                  className={`btn btn-xs rounded-full gap-1 ${
                    selectedMatchType === "perfect" ? "btn-primary" : "btn-outline btn-primary"
                  }`}
                >
                  <SparklesIcon className="size-3" />
                  Perfect Exchange
                </button>
                <button
                  onClick={() => setSelectedMatchType("native")}
                  className={`btn btn-xs rounded-full ${
                    selectedMatchType === "native" ? "btn-secondary" : "btn-outline btn-secondary"
                  }`}
                >
                  Native Speakers
                </button>
                <button
                  onClick={() => setSelectedMatchType("study")}
                  className={`btn btn-xs rounded-full ${
                    selectedMatchType === "study" ? "btn-accent" : "btn-outline btn-accent"
                  }`}
                >
                  Study Partners
                </button>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-8 text-center space-y-3">
              <h3 className="font-semibold text-lg">No matching learners found</h3>
              <p className="text-base-content opacity-70 max-w-md mx-auto text-sm">
                Try adjusting your search keywords, clearing language filters, or checking back
                later as new members join!
              </p>
              <div>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLanguage("all");
                    setSelectedMatchType("all");
                  }}
                  className="btn btn-outline btn-sm gap-1"
                >
                  <RotateCcwIcon className="size-3.5" />
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const outgoingRequestId = outgoingRequestsMap.get(user._id);
                const hasRequestBeenSent = Boolean(outgoingRequestId);
                const isPerfect = user.matchType === "Perfect Exchange";

                return (
                  <div
                    key={user._id}
                    className={`card bg-base-200 hover:shadow-xl transition-all duration-300 relative ${
                      isPerfect ? "border-2 border-primary/50 shadow-md" : ""
                    }`}
                  >
                    {isPerfect && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-primary badge-sm gap-1 shadow-sm font-semibold">
                          <SparklesIcon className="size-3" /> Top Pick
                        </span>
                      </div>
                    )}

                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full ring-2 ring-primary/20">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div className="pr-16">
                          <h3 className="font-semibold text-lg leading-tight">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SMART MATCH COMPATIBILITY BADGE */}
                      <div>
                        {user.matchType === "Perfect Exchange" ? (
                          <span className="badge badge-primary gap-1 font-semibold text-xs py-2">
                            <SparklesIcon className="size-3" /> 100% Reciprocal Match
                          </span>
                        ) : user.matchType === "Native Speaker" ? (
                          <span className="badge badge-secondary gap-1 font-medium text-xs py-2">
                            🎯 Native in your target language
                          </span>
                        ) : user.matchType === "Study Partner" ? (
                          <span className="badge badge-accent gap-1 font-medium text-xs py-2">
                            📚 Learning same language (50%)
                          </span>
                        ) : user.matchType === "Practice Partner" ? (
                          <span className="badge badge-info gap-1 font-medium text-xs py-2">
                            🤝 Learning your native language
                          </span>
                        ) : (
                          <span className="badge badge-ghost text-xs py-2">
                            🌐 Community Member
                          </span>
                        )}
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70 line-clamp-2">{user.bio}</p>}

                      {/* Action button */}
                      {hasRequestBeenSent ? (
                        <button
                          className="btn btn-outline btn-warning w-full mt-2"
                          onClick={() => cancelRequestMutation(outgoingRequestId)}
                          disabled={isCancelling}
                        >
                          <XCircleIcon className="size-4 mr-2" />
                          Cancel Request
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary w-full mt-2"
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={isSending}
                        >
                          <UserPlusIcon className="size-4 mr-2" />
                          Send Friend Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;