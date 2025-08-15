import React from "react";

const Comment = ({ comment }) => {
  const formatTime = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } else {
      return commentTime.toLocaleDateString();
    }
  };

  return (
    <div className="each-comment">
      <div className="comment-header">
        <img
          src={comment?.author?.profilePicture?.url}
          alt={`${comment?.author?.username}'s profile`}
          className="comment-avatar"
        />
        <div className="comment-content">
          <div className="comment-username">{comment?.author?.username}</div>
          <div className="comment-text">{comment?.text}</div>
        </div>
        <div className="comment-time">{formatTime(comment?.createdAt)}</div>
      </div>
    </div>
  );
};

export default Comment;
