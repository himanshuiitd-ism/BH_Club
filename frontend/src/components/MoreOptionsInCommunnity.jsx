import { CiEdit } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import EditCommunity from "./EditCommunity";
import { useState } from "react";

const MoreOptionsInCommunity = ({
  setMoreOptions,
  setEditProfile,
  setLeaveCommunity,
}) => {
  return (
    <div className="MoreOptions-Community">
      <div
        className="MoreOptions-Community-option1"
        onClick={() => setEditProfile(true)}
      >
        <CiEdit /> Edit Community
      </div>
      <div
        className="MoreOptions-Community-option2"
        onClick={() => setLeaveCommunity(true)}
      >
        <IoIosLogOut />
        Leave Community
      </div>
      <div className="MoreOptions-Community-option3">
        <MdOutlineHowToVote />
        Vote
      </div>
      <div className="MoreOptions-Community-option4">
        <AiOutlineUsergroupAdd />
        Create Room
      </div>
      <div
        className="MoreOptions-Community-option5"
        onClick={() => setMoreOptions(false)}
      >
        <MdOutlineCancel />
        Cancel
      </div>
    </div>
  );
};

export default MoreOptionsInCommunity;
