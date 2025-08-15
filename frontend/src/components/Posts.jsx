import React, { useEffect } from "react";
import Post from "./Post";
import { useSelector } from "react-redux";
import ErrorBoundary from "./ErrorBoundary";

const Posts = () => {
  // Correct the state path to match your Redux structure

  const { posts } = useSelector((store) => store.post);

  // Add a safeguard in case posts is undefined
  if (!posts) {
    return <div>Loading posts...</div>; // or null, or a loading spinner
  }
  const validPosts = posts?.filter((post) => post?._id) || [];

  return (
    <div>
      {posts.map((post) => (
        <ErrorBoundary key={post._id}>
          <Post post={post} />
        </ErrorBoundary>
      ))}
    </div>
  );
};

export default Posts;
