import { useState } from "react";

const DeletePost = ({ handleCloseDelete, handleDeleteClick, deleting }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringDelete, setIsHoveringDelete] = useState(false);
  const handleeventPropagation = (e) => {
    e.stopPropagation(); //iska mtlb hai ki ye useState ke value ko change nhi hone dega
  };
  return (
    <div className="delete-Post-Box" onClick={handleeventPropagation}>
      <center>
        <h1 style={{ fontSize: "30px" }}>
          <b>Deleting Post?</b>
        </h1>
      </center>
      <center>
        {isHoveringDelete ? (
          <p>Is this what you really want Mister/Mrs!😒</p>
        ) : isHovering ? (
          <p>That's a gr8 Choice Mister/Mrs😃</p>
        ) : (
          <p>
            Sir/Mam are you sure you want to delete this{" "}
            <b>marvelous post!☹️</b>
          </p>
        )}
      </center>
      <div>
        <button
          onMouseEnter={() => setIsHoveringDelete(true)}
          onMouseLeave={() => setIsHoveringDelete(false)}
          onClick={handleDeleteClick}
        >
          {deleting ? "Deleting...😒" : "Delete"}
        </button>
        <button
          onClick={handleCloseDelete}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeletePost;
