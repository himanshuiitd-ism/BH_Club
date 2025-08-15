import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    // Who will receive this notification
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who triggered this notification
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Type of notification
    type: {
      type: String,
      enum: ["like", "comment", "follow", "mention"],
      required: true,
    },
    // Related post (if applicable)
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    // Notification message
    message: {
      type: String,
      required: true,
    },
    // Whether the notification has been read
    isRead: {
      type: Boolean,
      default: false,
    },
    // Whether the notification has been seen (opened notification panel)
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
