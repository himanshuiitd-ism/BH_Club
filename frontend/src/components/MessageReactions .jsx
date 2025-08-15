import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import EmojiSelector from "./EmojiSelector";
import axios from "axios";

const MessageReactions = ({ message, onReactionUpdate, isOwnMessage }) => {
  const { user } = useSelector((store) => store.auth);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);

  // Update local reactions when message prop changes (real-time updates)
  useEffect(() => {
    setReactions(message.reactions || []);
  }, [message.reactions]);

  // Group reactions by emoji and count them
  const getReactionCounts = (reactionArray) => {
    const counts = {};
    reactionArray.forEach((reaction) => {
      if (!counts[reaction.emoji]) {
        counts[reaction.emoji] = {
          count: 0,
          users: [],
        };
      }
      counts[reaction.emoji].count++;
      counts[reaction.emoji].users.push(reaction.by);
    });

    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count) // Sort by count descending
      .map(([emoji, data]) => ({
        emoji,
        count: data.count,
        users: data.users,
      }));
  };

  const reactionCounts = getReactionCounts(reactions);

  // Check if current user has reacted with specific emoji
  const hasUserReacted = (emoji) => {
    return reactions.some(
      (reaction) =>
        reaction.emoji === emoji &&
        reaction.by.toString() === user._id.toString()
    );
  };

  // Handle emoji reaction
  const handleReaction = async (emoji) => {
    if (!emoji || !message._id) return;

    try {
      const response = await axios.put(
        `http://localhost:8001/api/v1/communities/${message._id}/like`,
        { emoji },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update local state immediately for better UX
        console.log("updated:", response.data);
        const hasReacted = hasUserReacted(emoji);
        let updatedReactions;

        if (hasReacted) {
          // Remove reaction
          updatedReactions = reactions.filter(
            (reaction) =>
              !(
                reaction.emoji === emoji &&
                reaction.by.toString() === user._id.toString()
              )
          );
        } else {
          // Add reaction
          updatedReactions = [...reactions, { emoji, by: user._id }];
        }

        setReactions(updatedReactions);

        // Notify parent component if needed
        if (onReactionUpdate) {
          onReactionUpdate(message._id, updatedReactions);
        }
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Failed to react to message");
    }
  };

  // Handle emoji selection from picker
  const handleEmojiSelect = (emoji) => {
    handleReaction(emoji);
    setShowEmojiSelector(false);
  };

  // Toggle existing reaction
  const toggleReaction = (emoji) => {
    handleReaction(emoji);
  };

  return (
    <div className="message-reactions-container">
      {/* Display existing reactions */}
      {reactionCounts.length > 0 && (
        <div className="reactions-display">
          {reactionCounts.map(({ emoji, count, users }, index) => {
            const userReacted = hasUserReacted(emoji);
            return (
              <button
                key={`${emoji}-${index}`}
                className={`reaction-item ${userReacted ? "user-reacted" : ""}`}
                onClick={() => toggleReaction(emoji)}
                title={`${count} reaction${count > 1 ? "s" : ""}`}
              >
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add reaction button */}
      <div className="add-reaction-wrapper">
        <button
          className="add-reaction-btn"
          onClick={() => setShowEmojiSelector(!showEmojiSelector)}
          aria-label="Add reaction"
        >
          <span className="add-reaction-icon">+</span>
          <span className="add-reaction-emoji">😊</span>
        </button>

        {/* Emoji selector */}
        {showEmojiSelector && (
          <EmojiSelector
            onEmojiSelect={handleEmojiSelect}
            isOwnMessage={isOwnMessage}
            onClose={() => setShowEmojiSelector(false)}
            position="top"
          />
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
