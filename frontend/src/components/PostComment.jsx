import React, { forwardRef, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { BsWindow } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import toast from "react-hot-toast";
import axios from "axios";
import { setPosts, setSelectedPost } from "../redux/postSlice";
import Posts from "./Posts";
import { Link } from "react-router-dom";

const PostComment = forwardRef(({ postComment }, ref) => {
  const [close, setClose] = useState(false);
  const [comment, setComment] = useState("");
  // const { posts } = useSelector((state) => state.post);
  const { selectedPost } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);

  const handleContainerClick = (e) => {
    e.stopPropagation(); //Prevent the closing of main box when clicked inside the box (ex:- when you click inside more-option-inside it should not close the modal but when you click outside the modal it should close)
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:8001/api/v1/post/posts/${selectedPost._id}/comments`,
        { text: comment },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setComment("");

        const newComment = res.data.data;
        //update redux store

        //this is for updating the post comment only but it doesn't increase the no. of post in home screen(view all x post) so we need updatedPost
        const updatedSelectedPost = {
          ...selectedPost,
          comments: [newComment, ...selectedPost.comments],
        };

        const updatedPosts = posts.map((post) =>
          post._id === selectedPost._id
            ? { ...post, comments: [newComment, ...post.comments] }
            : post
        );

        // Update both the selected post and posts array
        dispatch(setSelectedPost(updatedSelectedPost));
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  };

  return (
    <div
      ref={ref}
      className="comment-modal"
      onClick={handleContainerClick}
      style={{ zIndex: 10001 }}
    >
      <div
        className="comment-modal-image"
        style={{
          position: "relative", // Set position to relative for the container
          width: "50%", // Ensure it takes full width
          height: "100%", // Ensure it takes full height
          overflow: "hidden", // Prevent overflow
        }}
      >
        {/* Blurry Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${selectedPost.image.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(5px)",
            backgroundRepeat: "no-repeat",
            zIndex: 0, // Ensure it's behind the image
          }}
        />

        {/* Main Image (sharp) */}
        <img
          src={selectedPost?.image?.url}
          alt="Post"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            zIndex: 1, // Ensure it's above the blurred background
          }}
        />
      </div>

      <div className="comment-modal-content">
        <div className="comment-heading">
          <Link to="" className="comment-profile">
            <img
              src={selectedPost?.author?.profilePicture?.url}
              alt="Profile"
            />
            <span className="comment-username" style={{ fontSize: "1.25rem" }}>
              {selectedPost?.author?.username}
            </span>
          </Link>
          <div className="close-icon" onClick={() => setClose(!close)}>
            <BsThreeDots />
          </div>
        </div>
        <div
          className="comment-body"
          style={{ padding: "10px", height: "82%" }}
        >
          {selectedPost?.comments?.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}
        </div>
        <div className="comment-input">
          <input
            type="text"
            value={comment || ""} // Ensure value is never undefined
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Add a comment...  "⊞+." to add emoji`}
            className="comment-input-field"
            onKeyDown={handleKeyDown}
          />
          <button
            disabled={!comment.trim()}
            onClick={handleComment}
            className={!comment?.trim() ? "disabled-button" : "active-button"}
          >
            Post
          </button>
        </div>
      </div>

      {close && (
        <div className="more-options" onClick={() => setClose(false)}>
          <div className="more-option-inside" onClick={handleContainerClick}>
            <div
              style={{
                color: "#ff284c",
                fontWeight: "600",
                fontSize: "1.25rem",
              }}
            >
              Unfollow
            </div>
            <div>Add to Favorites</div>
            <div>Report</div>
            <div>Share to</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PostComment;
