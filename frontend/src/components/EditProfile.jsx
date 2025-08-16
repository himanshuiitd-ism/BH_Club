import { useDispatch, useSelector } from "react-redux";
import image from "./images/image3.png";
import { useRef, useState } from "react";
import { readFileAsDataURL } from "../utils/imageToUri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser, setUserProfile } from "../redux/authSlice";

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const imageref = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [input, setInput] = useState({
    bio: user?.bio || "",
    gender: user?.gender || "",
    privacy: user?.privacy || false,
  });
  const [loading, setLoading] = useState(false);
  const [requestBlocked, setRequestBlocked] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const imageUrl = await readFileAsDataURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
    }
  };

  const editProfileHandler = async (e) => {
    e.preventDefault();
    if (loading || requestBlocked) {
      toast.error("Please wait before making another request");
      return;
    }
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    formData.append("privacy", input.privacy);
    if (selectedFile) formData.append("profilePicture", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post(
        "https://bh-club.onrender.com/api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        const updatedData = {
          ...user,
          bio: res.data.data?.bio,
          profilePicture: {
            ...res.data.data?.profilePicture,
            url: res.data.data?.profilePicture?.url + `?${Date.now()}`,
          },
          privacy: res.data.data?.privacy,
          gender: res.data.data?.gender,
        };
        dispatch(setAuthUser(updatedData));
        navigate(`/${user?._id}/profile`);
      }
    } catch (error) {
      console.error("EditProfile Error:", error);

      if (error.response?.status === 429) {
        const waitTime = error.response.headers["retry-after"] || 10;
        toast.error(`Too many requests. Please wait ${waitTime} seconds.`);
        setTimeout(() => setRequestBlocked(false), waitTime * 1000);
      } else {
        setRequestBlocked(false);
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const displayImage =
    selectedImage ||
    (user?.profilePicture?.url
      ? `${user.profilePicture.url}?${Date.now()}`
      : image);

  return (
    <div className="Edit-Profile">
      <center>
        <h1 style={{ fontSize: "25px", width: "100%", marginBottom: "1rem" }}>
          Account-Management
        </h1>
      </center>
      <div className="firstChild">
        <div className="Edit-Profile-image-section">
          <div className="Edit-Profile-image-section-profile-image">
            <img
              src={displayImage}
              alt="profilePicture"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
            />
          </div>
          <div className="Edit-Profile-image-section-change-profile-image">
            <input
              type="file"
              ref={imageref}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            ></input>
            <button onClick={() => imageref?.current.click()}>
              Upload Photo
            </button>
          </div>
          <div className="Edit-Profile-image-section-changePassword">
            <div className="Edit-Profile-image-section-changePassword-input">
              <p>Old Password</p>
              <input type="password" />
            </div>
            <div className="Edit-Profile-image-section-changePassword-input">
              <p>New Password</p>
              <input type="password" />
            </div>
          </div>
        </div>
        <div className="Edit-Profile-Profile-info">
          <div className="Edit-Profile-Profile-info-Level1">
            <div className="Edit-Profile-Profile-info-Level2">
              {" "}
              <div
                className="Edit-Profile-image-section-changePassword-input"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <p>Username</p>
                <input type="text" />
              </div>
              <div
                className="Edit-Profile-image-section-changePassword-input"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <p>bio...</p>
                <input
                  type="text"
                  name="bio"
                  value={input.bio}
                  onChange={changeEventHandler}
                />
              </div>
              <div
                className="Edit-Profile-image-section-changePassword-input"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <p>Date of Birth</p>
                <input type="date" />
              </div>
            </div>
            <div className="Edit-Profile-Profile-info-Level3">
              <div
                className="Edit-Profile-image-section-changePassword-input"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <p>Email</p>
                <input type="email" />
              </div>{" "}
              <div
                className="Edit-Profile-image-section-changePassword-input"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <p>Gender</p>
                <input
                  type="text"
                  name="gender"
                  value={input.gender}
                  onChange={changeEventHandler}
                />
              </div>{" "}
              <div
                className="Edit-Profile-image-section-changePassword-input"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <p>Privacy</p>
                <select
                  className="custom-select"
                  name="privacy"
                  value={input.privacy}
                  onChange={changeEventHandler}
                >
                  <option className="custom-drop" value={false}>
                    Public
                  </option>
                  <option className="custom-drop" value={true}>
                    Private
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="Edit-Profile-Profile-info-Level4">
            <div
              className="Edit-Profile-image-section-changePassword-input"
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <p>Discord</p>
              <input type="text" required />
            </div>
            <div
              className="Edit-Profile-image-section-changePassword-input"
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <p>Telegram</p>
              <input type="text" required />
            </div>
          </div>
          <p style={{ marginLeft: "10px" }}>About You...</p>
          <textarea
            rows={2}
            placeholder="Tell others about you..."
            maxLength={150}
            style={{
              width: "100%",
              border: "1px solid #8e8e8e",
              marginTop: "10px",
              borderRadius: "8px",
              padding: "1rem",
              outline: "none",
            }}
          />
        </div>
      </div>
      {loading ? (
        <button
          type="submit"
          className="EditProfile-submit"
          onClick={editProfileHandler}
        >
          Please Wait...
        </button>
      ) : (
        <button
          type="submit"
          className="EditProfile-submit"
          onClick={editProfileHandler}
        >
          Change Profile
        </button>
      )}
    </div>
  );
};

export default EditProfile;
