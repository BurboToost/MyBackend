import e from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend v
  //validation - !empty v
  // check if user alreay exists : username , email v
  // check for images, check for avatar v
  // upload them to cloudinary, avatar v
  // create user object - create entryu in db v
  // remove passwor an refresh token field from response v
  // check for user creation v
  // return res v

  const { fullName, email, usernanme, password } = req.body;
  console.log(email);

  if (fullName === "" || email === "" || usernanme === "" || password === "") {
    throw new ApiError("All fields are required", 400);
  }

  const exitUser = User.findOne({
    $or: [{ email }, { username }],
  });
  if (exitUser) {
    throw new ApiError("User with same email or username already exists", 409);
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImgLocalpath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar is required", 400);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError("Avatar is required", 400);
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("User creation failed", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User created successfully", createdUser));
});

export { registerUser };
