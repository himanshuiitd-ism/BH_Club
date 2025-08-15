import { useEffect, useState } from "react";
import { readFileAsDataURL } from "../utils/imageToUri";
import { useRef } from "react";
import image from "./images/image3.png";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { setSelectedCommunity } from "../redux/communityslice";

const EditCommunity = ({ setEditProfile }) => {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [communityName, setCommunityName] = useState();
  const [isLocked, setIsLocked] = useState();
  const imageref = useRef();
  const { user } = useSelector((state) => state.auth);
  const { selectedCommunity } = useSelector((store) => store.community);
  const dispatch = useDispatch();

  const handleImageChange = async (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const imageUrl = await readFileAsDataURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
    }
  };

  const editCommunity = async (e) => {
    e.preventDefault();
    if (!selectedCommunity?._id || !user) {
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", communityName);
    formData.append("locked", isLocked);
    if (selectedFile) formData.append("newPhoto", selectedFile);
    try {
      const res = await axios.post(
        `http://localhost:8001/api/v1/communities/${selectedCommunity._id}/editCommunity`,
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
        dispatch(
          setSelectedCommunity(res.data?.data?.community || res.data?.community)
        );
      } else {
        toast.error("Only admin can edit profile");
      }
    } catch (error) {
      console.log("error is :", error);
    } finally {
      setLoading(false);
      setEditProfile(false);
    }
  };
  return (
    <div
      className="edit-community-overlay"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="edit-community-container">
        <div className="edit-community-header">
          <h1>Community Management</h1>
        </div>

        <div className="edit-community-content">
          {/* Image Section */}
          <div className="edit-community-image-section">
            <div className="edit-community-image-wrapper">
              <img
                src={
                  selectedImage || selectedCommunity?.profilePhoto?.url || image
                }
                alt="Community Profile"
                className="edit-community-image"
              />
            </div>
            <input
              type="file"
              ref={imageref}
              accept="image/*"
              onChange={handleImageChange}
              className="edit-community-file-input"
            />
            <button
              onClick={() => imageref?.current?.click()}
              className="edit-community-upload-btn"
            >
              📷 Upload Photo
            </button>
          </div>

          {/* Form Section */}
          <div className="edit-community-form">
            <div className="edit-community-form-group">
              <label className="edit-community-label">Community Name</label>
              <input
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="edit-community-input"
                placeholder="Enter community name"
              />
            </div>

            <div className="edit-community-form-group">
              <label className="edit-community-label">Privacy Settings</label>
              <div className="edit-community-privacy-toggle">
                <span className="edit-community-privacy-text">
                  {selectedCommunity?.locked
                    ? "🔒 Private Community"
                    : "🔓 Public Community"}
                </span>
                <label className="edit-community-switch">
                  <input
                    type="checkbox"
                    checked={isLocked}
                    onChange={(e) => setIsLocked(e.target.checked)}
                  />
                  <span className="edit-community-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="edit-community-actions">
            <button
              className="edit-community-cancel-btn"
              onClick={() => setEditProfile(false)}
            >
              Cancel
            </button>
            <button
              className="edit-community-save-btn"
              onClick={(e) => editCommunity(e)}
              disabled={loading}
            >
              {loading ? "⏳ Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCommunity;
