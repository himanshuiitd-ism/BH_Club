import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Community, MessageInComm } from "../models/community.model.js";
import { User } from "../models/user.model.js";
import { io } from "../socket/socket.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const makeCommunity = asyncHandler(async (req, res) => {
  try {
    const { name, members = [], locked } = req.body; // Changed 'private' to 'locked' to match frontend
    const createdBy = req.user._id;

    if (!name || !name.trim()) {
      throw new ApiError(400, "Give your creation a name");
    }

    const allMembers = new Set([createdBy.toString(), ...members.map(String)]);
    const uniqueMembers = Array.from(allMembers);

    if (uniqueMembers.length < 1) {
      // Changed from < 1 to >= 1 since creator is included
      throw new ApiError(400, "Community needs at least one member");
    }

    const community = await Community.create({
      name,
      members: uniqueMembers,
      locked,
      createdBy,
    });

    // FIX: Use updateMany instead of findByIdAndUpdate
    await User.updateMany(
      { _id: { $in: uniqueMembers } },
      { $addToSet: { communities: community._id } } // Use $addToSet to avoid duplicates
    );

    // Add socket emission for real-time updates
    const io = req.app.get("io");
    if (io) {
      uniqueMembers.forEach((memberId) => {
        io.to(memberId.toString()).emit("newCommunityCreated", {
          communityId: community._id,
          communityName: community.name,
          members: uniqueMembers,
          createdBy: createdBy.toString(),
        });
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, community, "Community created successfully"));
  } catch (error) {
    console.error("Community creation error:", error);
    throw new ApiError(400, error.message || "Community creation failed");
  }
});

export const suggestedCommunuity = asyncHandler(async (req, res) => {
  try {
    const suggestedCommunuity = await Community.find({
      members: { $ne: req.user._id },
    }).limit(10);

    return res.status(200).json(new ApiResponse(200, suggestedCommunuity, ""));
  } catch (error) {
    throw new ApiError(404, error.message || "No community found");
  }
});

export const addMembers = asyncHandler(async (req, res) => {
  try {
    const { members = [] } = req.body;
    const communityId = req.params.communityId;
    const userId = req.user._id;

    if (!Array.isArray(members) || members.length === 0) {
      throw new ApiError(400, "Add atleast one user");
    }

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, "Community doesn't exist");
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isMember) {
      throw new ApiError(
        403,
        "You are not part of this community, so you can't add members"
      );
    }

    //User can add only one who are in both his/her following/follower list
    const user = await User.findById(userId).select("followers following");
    const followingSet = new Set(user.following.map((id) => id.toString()));
    const followerSet = new Set(user.followers.map((id) => id.toString()));

    //Mututals =those whom I follow and who followed me back
    const mutuals = [...followingSet].filter((id) => followerSet.has(id));
    const validMutuals = members.filter((id) =>
      mutuals.includes(id.toString())
    );

    if (validMutuals.length === 0) {
      throw new ApiError(400, "You can only add mutual followers");
    }

    //Filter out user who are already part of community
    const newMembersToAdd = validMutuals.filter(
      (id) =>
        !community.members.map((m) => m.toString()).includes(id.toString())
    );
    //.map =>ek kaam pure array pe kr ke deta hai
    //.some =>kuch array me atleast ek baar bhi hai ya nahi iske base pe true/false return krta hai
    //.filter =>wo saare values return krta hai jiske lea ander wala relation true hai ,jaise yaha id dega jiske lea " !community.members.map((m) => m.toString()).includes(id.toString())" true hai

    if (newMembersToAdd.length === 0) {
      throw new ApiError(400, "All users are already members of the community");
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      community,
      {
        $addToSet: { members: { $each: newMembersToAdd } },
      },
      { new: true }
    );

    await User.updateMany(
      { _id: { $in: newMembersToAdd } },
      { $addToSet: { communities: communityId } }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCommunity, "New Members added successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to add members");
  }
});

export const joinGroup = asyncHandler(async (req, res) => {
  try {
    const communityId = req.params._id;
    const userId = req.user._id;

    const community = await Community.findById(communityId);

    if (!community) {
      throw new ApiError(404, "Community doesn't exists");
    }

    if (community.locked) {
      throw new ApiError(400, "Community is locked ,inner member can add you");
    }

    if (community.members.includes(userId)) {
      return res
        .status(200)
        .json(new ApiResponse(200, community, "Already a member of community"));
    }

    community.members.push(userId);
    await community.save(); //ye database ka fxn hai to await to lagana pdega

    return res
      .status(200)
      .json(
        new ApiResponse(200, community, "Successfully joined the community")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to join the community");
  }
});

export const sendMsgInCommunity = asyncHandler(async (req, res) => {
  try {
    const senderId = req.user._id;
    const {
      content,
      senderRandomName = "Unknown Paka Aloo",
      senderDisplayProfile = "🐶",
    } = req.body;
    const communityId = req.params.communityId;

    if (!content || !content.trim()) {
      throw new ApiError(400, "Enter some message content");
    }

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Check if user is member of the community
    if (!community.members.includes(senderId)) {
      throw new ApiError(403, "You are not a member of this community");
    }

    const newMsg = await MessageInComm.create({
      community: communityId,
      sender: senderId,
      senderDisplayName: senderRandomName,
      senderDisplayProfile,
      content: content.trim(),
    });

    // Populate sender details for the response
    const populatedMsg = await MessageInComm.findById(newMsg._id).populate(
      "sender",
      "username profilePicture"
    );

    community.messages.push(newMsg._id);
    await community.save();

    // Create the message object to send via socket
    const messageToEmit = {
      _id: populatedMsg._id,
      community: communityId,
      sender: {
        _id: senderId,
        username: populatedMsg.sender.username,
        profilePicture: populatedMsg.sender.profilePicture,
      },
      senderDisplayName: senderRandomName,
      senderDisplayProfile,
      content: content.trim(),
      reports: [],
      reactions: [],
      createdAt: populatedMsg.createdAt,
      updatedAt: populatedMsg.updatedAt,
    };

    // ✅ Socket emit to community room

    io.to(communityId).emit("newCommunityMessage", messageToEmit);

    return res
      .status(200)
      .json(new ApiResponse(200, messageToEmit, "Message sent successfully"));
  } catch (error) {
    console.error("Error in sendMsgInCommunity:", error);
    throw new ApiError(500, error.message || "Message not sent");
  }
});

//Like message
export const likeMsg = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;
    const { emoji } = req.body;

    if (!emoji || !emoji.trim()) {
      throw new ApiError(400, "Emoji is required");
    }

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const message = await MessageInComm.findById(messageId);

    if (!message) {
      throw new ApiError(404, "Message not found or invalid");
    }

    const hasReacted = message.reactions.some(
      (r) => r.emoji === emoji && r.by.toString() === userId.toString()
    ); //toString for comparison , hasReacted ka value true/false

    const updatedMessage = await MessageInComm.findByIdAndUpdate(
      messageId,
      hasReacted
        ? { $pull: { reactions: { emoji: emoji, by: userId } } }
        : { $push: { reactions: { emoji: emoji, by: userId } } },
      { new: true }
    );

    if (!updatedMessage) {
      throw new ApiError(400, "Failed to update Reaction");
    }

    io.to(updatedMessage.community._id.toString()).emit(
      "messageReactionUpdate",
      updatedMessage
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedMessage,
          `Message ${hasReacted ? "Removed👎" : "Reacted👍"}`
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;

    const message = await MessageInComm.findById(messageId);
    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    // Check if user is the sender of the message
    if (message.sender.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own messages");
    }

    const communityId = message.community;

    // Remove message from community's messages array
    await Community.findByIdAndUpdate(communityId, {
      $pull: { messages: messageId },
    });

    // Delete the message
    await MessageInComm.findByIdAndDelete(messageId);

    // Emit deletion event to community room

    io.to(communityId).emit("communityMessageDeleted", {
      messageId,
      communityId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Message deleted successfully"));
  } catch (error) {
    console.error("Error in deleteMsgFromCommunity:", error);
    throw new ApiError(500, error.message || "Message not deleted");
  }
});

export const reportMessage = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.messageId;
    const { reason } = req.body;

    if (!reason) {
      throw new ApiError(400, "Report reason is required");
    }

    const message = await MessageInComm.findById(messageId);

    // const reported = message.reports.by.includes(userId); =>this will not work because report is a array of multiple object and not a single object

    const reported = message.reports.some(
      (report) => report.by.toString() === userId.toString()
    );

    if (reported) {
      throw new ApiError(401, "You can't report a message twice");
    }

    const updatedMessage = await MessageInComm.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reports: {
            reason,
            by: userId,
          },
        },
      },
      { new: true }
    );

    if (updatedMessage.reports.length >= 5) {
      await MessageInComm.findByIdAndDelete(messageId);
      await Community.findByIdAndUpdate(updatedMessage.community, {
        $pull: {
          messages: messageId,
        },
      });
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "Message auto deleted after 5 reports")
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedMessage, "Message reported successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something's wrong with reporting fxn");
  }
});

export const toggleLockCommunity = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;
    const { name, lockStatus } = req.body;

    const community = await Community.findById(communityId);

    if (!community) {
      throw new ApiError(400, "Community not found");
    }

    const isAdmin = community.createdBy.toString() === userId.toString();
    const newName = name && name.trim() ? name : community.name;

    if (!isAdmin) {
      throw new ApiError(401, "Only owner can change setting");
    }

    const isLocked =
      typeof lockStatus === "boolean" ? lockStatus : community.locked;
    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
      {
        name: newName,
        locked: isLocked,
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedCommunity, "Updated Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something is wrong in updation system"
    );
  }
});

export const getCommunityMessage = asyncHandler(async (req, res) => {
  try {
    const communityId = req.params.communityId;

    const messages = await MessageInComm.find({
      community: communityId,
    })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, messages, ""));
  } catch (error) {
    throw new ApiError(400, "Something is wrong with Messages");
  }
});

// export const deleteReportedMessage = asyncHandler(async(req,res)=>{
//   const message
// })

export const leaveCommunuity = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(400, "Communnity not found");
    }

    const ismember = community.members.some(
      (user) => user.toString() === userId.toString()
    );

    if (!ismember) {
      throw new ApiError(400, "You are not part of this community");
    }

    if (community.createdBy.toString() === userId.toString()) {
      throw new ApiError(403, "You can't abandon your creation");
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
      {
        $pull: { members: userId },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { communities: communityId },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedCommunity, "Left the community"));
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "Something is wrong with leaveCommunity"
    );
  }
});

export const deleteCommunityStart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(401, "Community not found");
    }

    if (community.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "Only the admin can initiate deletion voting");
    }

    const now = Date.now();
    const alreadyStarted = community.deleteComm;
    const startedAt = new Date(community.deleteCommInitiatedAt).getTime();

    if (alreadyStarted && now - startedAt < 24 * 60 * 60 * 1000) {
      throw new ApiError(403, "You can't cancel vote within one day");
    }

    //Allow cancelation after one day
    if (alreadyStarted && now - startedAt >= 24 * 60 * 60 * 1000) {
      community.deleteComm = false;
      community.deleteCommInitiatedAt = null;
      community.deleteVote = [];
      await community.save();
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Community delete vote cancelled"));
    }

    community.deleteComm = true;
    community.deleteCommInitiatedAt = new Date();
    community.deleteVote = [userId];
    await community.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Community delete vote started"));
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "Something wrong with deleteCommunityStarting"
    );
  }
});

//Voting endpoint for normal users

export const voteDeleteCommunity = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params._id;

    const community = await Community.findById(communityId);

    if (!community || !community.deleteComm) {
      throw new ApiError(400, "No active delete voting");
    }

    const userIdStr = userId.toString();
    const alreadyVoted = community.deleteVote.some(
      (id) => id.toString() === userIdStr
    );

    if (alreadyVoted) {
      community.deleteVote.pull(userId);
      await community.save();
      return res.status(200).json(new ApiResponse(200, null, "Vote removed"));
    }

    community.deleteVote.push(userId);
    await community.save();

    //Check if voting count is >50%
    const total = community.members.length;
    const voted = community.deleteVote.length;

    if (voted / total >= 0.5) {
      await Community.findByIdAndDelete(communityId);
      await User.updateMany(
        { _id: { $in: community.members } },
        { $pull: { communities: communityId } }
      );

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Community deleted by majority vote"));
    }
    return res.status(200).json(new ApiResponse(200, null, "Vote Recorded"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something is wront with voting system"
    );
  }
});

//Pin message

export const togglePinMsg = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;
    const communityId = req.params.communityId;

    const community = await Community.findById(communityId);
    const message = await MessageInComm.findById(messageId);

    if (!community) {
      throw new ApiError(404, "Community not found");
    }
    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    //Check for message in same community
    if (message.community.toString() !== communityId.toString()) {
      throw new ApiError(400, "You can only pin message of this commuity");
    }

    if (
      community?.pinnedMessage?.message?.toString() === messageId?.toString()
    ) {
      throw new ApiError(400, "This message is already pinned");
    }

    //I want that only one msg should be pinned and when new one comes ,previous one will automatically removed from pin

    community.pinnedMessage = {
      message: messageId,
      pinnedBy: userId,
      pinnedAt: new Date(),
    };

    await community.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          community.pinnedMessage,
          "Message Pinned Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something is wrong with togglePinMsg"
    );
  }
});

// export const
export const unpinMsg = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;

    const community = await Community.findById(communityId).populate(
      "pinnedMessage.message"
    );

    if (!community || !community.pinnedMessage?.message) {
      throw new ApiError(404, "No pinned message found in this community");
    }

    const pinnedMsg = community.pinnedMessage?.message;

    const isAdmin = community.createdBy.toString() === userId.toString();
    const isPinner =
      community.pinnedMessage?.pinnedBy.toString() === userId.toString();
    const isSender = pinnedMsg.sender.toString() === userId.toString();

    if (!isAdmin && !isPinner && !isSender) {
      throw new ApiError(403, "You can't unpin the message");
    }

    community.pinnedMessage = undefined;
    await community.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Message unpinned successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something is wront with unpinMsg"
    );
  }
});

export const deleteCommunityByOwner = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const communityId = req.params.communityId;

  const user = await User.findById(userId).select("username");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.username !== "himanshu") {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          null,
          "You are not authorized to perform this action"
        )
      );
  }

  const community = await Community.findById(communityId);
  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  await Community.findByIdAndDelete(communityId);
  await Community.save();
  await User.updateMany(
    { _id: { $in: community.members } },
    { $pull: { communities: communityId } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Community deleted by App Owner"));
});

//Edit profile of community

export const editProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;
    const { name, locked } = req.body;
    const newPhoto = req.file;

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    if (community.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "Only community admin can edit it ");
    }

    if (name !== undefined) community.name = name;
    if (locked !== undefined) {
      community.locked = locked === "true" || locked === true;
    }

    if (newPhoto) {
      if (community.profilePhoto?.publicId) {
        await cloudinary.uploader.destroy(community.profilePhoto.publicId);
      }

      const fileUri = getDataUri(newPhoto);
      const cloudResult = await cloudinary.uploader.upload(fileUri, {
        folder: `communities/${communityId}`,
        transformation: [
          { width: 500, height: 500, crop: "fill", quality: "auto" },
          { fetch_format: "auto" },
        ],
      });
      community.profilePhoto = {
        url: cloudResult.secure_url,
        publicId: cloudResult.public_id,
      };
    }

    await community.save();

    return res
      .status(200)
      .json(new ApiResponse(200, community, "Community Updated Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something is wrong with editProfile"
    );
  }
});

export const getCommunityProfile = asyncHandler(async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const community = await Community.findById(communityId).populate(
      "members",
      "username profilePicture"
    );
    if (!community) {
      throw new ApiError(404, "Community not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, community, "Community fetched"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something is wrong with fetching community"
    );
  }
});

export const markMessagesAsSeen = asyncHandler(async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    if (!community.members.includes(userId)) {
      throw new ApiError(403, "You are not a member of this community");
    }

    await MessageInComm.updateMany(
      {
        community: communityId,
        sender: { $ne: userId },
        "seenBy.user": { $ne: userId }, //wo msg jo ye user already dekha na ho
      },
      {
        $addToSet: {
          seenBy: {
            user: userId,
            seenAt: new Date(),
          },
        },
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Message marked as seen"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to mark messages as seen");
  }
});

export const getUnseenCount = asyncHandler(async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const userId = req.user._id;
    const unseenCount = await MessageInComm.countDocuments({
      community: communityId,
      sender: { $ne: userId },
      "seenBy.user": { $ne: userId },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { unseenCount }, "Unseen count fetched"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to get unseen count");
  }
});
