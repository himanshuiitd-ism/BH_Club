//I coppied it from delete post so the Class name are same

import { useState } from "react";

const Logout = ({ logout, setLogOut, logoutHandler }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringDelete, setIsHoveringDelete] = useState(false);
  const handleeventPropagation = (e) => {
    e.stopPropagation(); //iska mtlb hai ki ye useState ke value ko change nhi hone dega
  };
  return (
    <div className="delete-Post-Box" onClick={handleeventPropagation}>
      <center>
        <h1 style={{ fontSize: "30px" }}>
          <b>Log Out?</b>
        </h1>
      </center>
      <center>
        {isHoveringDelete ? (
          <p>Are you really leaving us alone!😒</p>
        ) : isHovering ? (
          <p>ThankGod you are not leaving us alone😃</p>
        ) : (
          <p>
            Sir/Mam are you Leaving us without your wonderful presence <b>☹️</b>
          </p>
        )}
      </center>
      <div>
        <button
          onMouseEnter={() => setIsHoveringDelete(true)}
          onMouseLeave={() => setIsHoveringDelete(false)}
          onClick={logoutHandler}
        >
          LogOut
        </button>
        <button
          onClick={() => setLogOut(false)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Logout;
