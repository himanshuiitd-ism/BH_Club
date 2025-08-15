import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, password, email].some((field) => field.trim() === "")) {
    throw new ApiError(400, "please provide required field");
  }

  const ifUserExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (ifUserExist) {
    throw new ApiError(400, "User with this email or username already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if ([username, password].some((item) => item.trim() === "")) {
    throw new ApiError(400, "Enter both usernmae and password");
  }

  //username and password check

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(400, "User doesn't exists");
  }

  const passwordVerification = await user.isPasswordcorrect(password);

  if (!passwordVerification) {
    throw new ApiError(400, "Please enter correct password");
  }

  //cookies generation

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  ); //after this User got refreshed

  // Populate user's posts
  const logedInUser = await User.findById(user._id)
    .select("-password -refreshToken") // Exclude sensitive fields
    .populate({
      path: "posts",
      select: "caption image createdAt likes comments", // Adjust the fields you want to select from posts
    });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken, //this is client side ref token , we match this from backend and if both are same ,we do what we have to do.
          //both acc and ref token are needed to present at client side
        },
        `Welcome Back ${logedInUser.username}`
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout Successfully"));
});

export const getProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id;
    if (!userId) {
      throw new ApiError(400, "User is not valid");
    }
    const userProfile = await User.findById(userId)
      .select("-password -refreshToken")
      .populate({
        path: "posts",
        createdAt: -1,
      })
      .populate({
        path: "bookmarks",
        createdAt: -1,
      });
    if (!userProfile) {
      throw new ApiError(400, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, userProfile, ""));
  } catch (error) {
    console.error("Someting is wrong in line 132 to 142 :", error);
  }
});

export const editProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio, gender, privacy } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Handle profile picture update
    if (profilePicture) {
      // Delete old image if exists
      if (user.profilePicture?.publicId) {
        await cloudinary.uploader
          .destroy(user.profilePicture.publicId)
          .catch((error) => console.error("Old image deletion failed:", error));
      }

      // Upload new image
      const fileUri = getDataUri(profilePicture);
      const cloudResponse = await cloudinary.uploader.upload(fileUri, {
        folder: `users/${userId}`,
        transformation: [
          { width: 500, height: 500, crop: "fill", quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      user.profilePicture = {
        url: cloudResponse.secure_url,
        publicId: cloudResponse.public_id,
      };
    }

    // Update other fields
    if (bio !== undefined) user.bio = bio;
    if (gender !== undefined) user.gender = gender;
    if (privacy !== undefined) {
      user.privacy = privacy === "true" || privacy === true; //now any other thing than "true" or true is consider false
    }

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          gender: user.gender,
          privacy: user.privacy,
        },
        "Profile updated successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Profile update failed"
    );
  }
});

export const getSuggestedUser = asyncHandler(async (req, res) => {
  try {
    const suggestedUser = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("-password -refreshToken")
      .limit(10);

    // Check if array is empty, not if it's falsy
    if (suggestedUser.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, { users: [] }, "No suggested users found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { users: suggestedUser },
          "Suggested users fetched successfully"
        )
      );
  } catch (error) {
    console.error("error in suggestion part: ", error);
    // Make sure to send a response in case of error
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

export const followOrUnfollow = asyncHandler(async (req, res) => {
  try {
    const followKrneWala = req.user._id;
    const jiskoFollowKrunga = req.params._id; //routes me jo id hai wo us user ki id hai meri nahi hai

    if (followKrneWala === jiskoFollowKrunga) {
      throw new ApiError(401, "You can't folllow urself");
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      throw new ApiError(400, "User not found");
    }

    const isFollowing = user.following.includes(jiskoFollowKrunga);

    if (isFollowing) {
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json(new ApiResponse(200, "", "Unfollow Successfully"));
    } else {
      //when we need to involve multiple db calls so as it takes time we return the promise
      //yaha initial state change krna hai iseleye updateone
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ), //no await is needed as promise all is like await
      ]);
      return res
        .status(200)
        .json(new ApiResponse(200, "", "followed Successfully"));
    }
  } catch (error) {
    throw new ApiError(500, error.message || "Follow/unfollow failed");
  }
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password || !password.trim()) {
      throw new ApiError(400, "Enter Password");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const passwordVerification = await user.isPasswordcorrect(password);

    if (!passwordVerification) {
      throw new ApiError(401, "Incorrect Password");
    }

    //Get all user post to delete them

    const userPosts = await Post.find({ author: userId });

    if (userPosts.length > 0) {
      const imageDeletePromises = userPosts
        .filter((post) => post.image?.publicId)
        .map((post) =>
          cloudinary.uploader
            .destroy(post.image.publicId)
            .catch((error) =>
              console.error(
                `Failed to delete image ${post.image.publicId}`,
                error.message
              )
            )
        );
      await Promise.allSettled(imageDeletePromises);
    }
    //filter bcoz user might have text post or post whose image is defected and not uploded , so we just don't call them from cloudinary bcoz it charges for every Api call

    //Delete userProfile
    if (user.profilePicture?.publicId) {
      cloudinary.uploader
        .destroy(user.profilePicture.publicId)
        .catch((error) =>
          console.error("Failed to delete profilePicture ", error)
        );
    }

    //remove user from followers/following list of other
    await Promise.all([
      User.updateMany({ followers: userId }, { $pull: { followers: userId } }),
      User.updateMany({ following: userId }, { $pull: { following: userId } }),
    ]);

    //Delete all userPost (1st wale me bs image delete hua tha na)
    await Post.deleteMany({ author: userId });

    //delete users like / comments

    await Promise.all([
      Post.updateMany({ likes: userId }, { $pull: { likes: userId } }),
      Post.updateMany(
        { "comments.author": userId },
        { $pull: { comments: { author: userId } } } //un comments ka sb kuch pull kr lo jinka author userId ho
      ),
    ]);

    //now delete userAccount
    await User.findByIdAndDelete(userId);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Account deleted successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something gone wrong while deleteing account"
    );
  }
});
