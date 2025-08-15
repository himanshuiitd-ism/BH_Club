import mongoose, { mongo, Schema } from "mongoose";

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profilePhoto: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    description: String,
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ], // user IDs
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }, // admin
    locked: {
      type: Boolean,
      default: false,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "MessageInComm",
      },
    ],
    pinnedMessage: {
      message: {
        type: Schema.Types.ObjectId,
        ref: "MessageInComm",
        required: false,
      },
      pinnedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      pinnedAt: {
        type: Date,
        default: Date.now,
      },
    },

    deleteComm: {
      type: Boolean,
      default: false,
    },
    deleteCommInitiatedAt: {
      type: Date,
      default: null,
    },
    deleteVote: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Community = mongoose.model("Community", communitySchema);

const commMessageSchema = new Schema(
  {
    community: {
      //here community acts as receiver as there are no
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    senderDisplayName: {
      type: String,
      require: true,
    },
    senderDisplayProfile: {
      type: String,
      required: true,
      default: "🐶",
    },
    content: {
      type: String,
      required: true,
    },
    seenBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reactions: [
      {
        emoji: { type: String, required: true },
        by: { type: Schema.Types.ObjectId, ref: "User", required: true },
        _id: false,
      },
    ],
    reports: [
      {
        reason: {
          type: String,
          enum: ["spam", "inappropriate", "harassment", "fake", "other"],
          required: true,
        },
        by: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        _id: false, // avoids creating separate _id for each report
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const MessageInComm = mongoose.model("MessageInComm", commMessageSchema);
