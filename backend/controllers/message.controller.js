import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { io, receiverSocketId } from "../socket/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;
    const { textMsg: message } = req.body; //textMsg ke name se msg lelenge

    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    let conversation = await Conversation.findOne({
      //"let" just bcoz it is reasigned inside if statement
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([newMessage.save(), conversation.save()]);

    const getreceiverSocketId = receiverSocketId(receiverId);

    if (getreceiverSocketId) {
      io.to(getreceiverSocketId).emit("newMessage", newMessage); //el event listener newMessage name ka jisse newMessage receive krunga
    }

    return res.status(200).json(
      new ApiResponse(200, newMessage, "") //hr baar send krne pe data to newMessage hi hoga na
    );
  } catch (error) {
    throw new ApiError(400, error.message || "message not sent");
  }
});
// Replace your getMessage controller with this:

// Replace your getMessage controller with this:

export const getMessage = asyncHandler(async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [receiverId, senderId] }, // Use $all for better matching
    }).populate({
      path: "messages",
      populate: {
        path: "sender receiver",
        select: "username profilePicture",
      },
    });

    if (!conversation) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            messages: [],
          },
          "No conversation found"
        )
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages: conversation.messages || [],
        },
        "Messages retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error in getMessage:", error);
    return res.status(500).json(
      new ApiResponse(
        500,
        {
          messages: [],
        },
        error.message || "Failed to get messages"
      )
    );
  }
});
