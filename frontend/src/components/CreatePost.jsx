import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { readFileAsDataURL } from "../utils/imageToUri";
import axios from "axios";
import toast from "react-hot-toast";
import { setPosts } from "../redux/postSlice";

const CreatePost = ({ postOpen, setPostOpen }) => {
  const imageref = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.post);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onclickHandle = (e) => {
    e.stopPropagation();
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }; //this prevent the removal of photos on refresh

  const createPostHandler = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file); // This should match multer field name in backend (check in post.routes.js)

    try {
      setLoading(true);
      const res = await axios.post(
        "https://bh-club.onrender.com/api/v1/post/userpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // Reset form
        setCaption("");
        setFile("");
        setImagePreview("");
        setPostOpen(false);

        // Update posts - your backend returns the populated post in res.data.data
        const newPost = res.data.data;
        dispatch(setPosts([newPost, ...(posts || [])]));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Post creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCaption("");
    setFile("");
    setImagePreview("");
    setPostOpen(false);
  };

  return (
    <div className="post-modal" onClick={onclickHandle}>
      <center>
        <b>Create New Post</b>
      </center>

      <div className="profile-photo-createPost">
        <div>
          <img src={user?.profilePicture?.url} alt="Profile" />
        </div>
        <div>{user?.username}</div>
      </div>

      <div className="add-caption">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a Caption..."
          rows={3}
        />
      </div>

      {imagePreview && (
        <div className="newPostImage">
          <img src={imagePreview} alt="Preview" />
        </div>
      )}

      <div className="newPost-info">
        <input
          type="file"
          className="hidden"
          ref={imageref}
          onChange={fileChangeHandler}
          accept="image/*"
        />
        <button onClick={() => imageref.current.click()}>
          Upload from Computer
        </button>
      </div>

      {imagePreview && (
        <button
          type="submit"
          className="newPost-submit"
          onClick={createPostHandler}
          disabled={loading}
          style={{
            width: "100%",
            height: "35px",
            backgroundColor: loading ? "#ccc" : "black",
            color: "white",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {loading ? "Please Wait..." : "Post"}
        </button>
      )}

      <button
        onClick={handleClose}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "transparent",
          border: "1px solid #ccc",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default CreatePost;
