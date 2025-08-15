import React from "react";
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightSideBar from "./RightSideBar";
import useGetAllPost from "../hooks/useGetAllPosts";
import useGetSuggestedUser from "../hooks/useGetSuggestedUser";
import { useDispatch, useSelector } from "react-redux";
import { setFollowedCommunity } from "../redux/communityslice";

const Home = () => {
  useGetAllPost();
  useGetSuggestedUser(); //jo home pe sara chahie load hote hi unke lea hooks bana ke yaha add kr dete hai

  return (
    <div className="home">
      <div className="home-left">
        <Feed />
        <Outlet />
      </div>
      <div className="home-right">
        <RightSideBar />
      </div>
    </div>
  );
};

export default Home;
