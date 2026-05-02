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

  const { fullName, email, username, password } = req.body;
  console.log(email);
  console.log("req.files:", req.files);

  if (fullName === "" || email === "" || username === "" || password === "") {
    throw new ApiError(400, "All fields are required");
  }

  const existUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existUser) {
    throw new ApiError(409, "User with same email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImgLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  console.log("Uploading avatar from:", avatarLocalPath);
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Avatar upload result:", avatar);

  const coverImage = coverImgLocalPath
    ? await uploadOnCloudinary(coverImgLocalPath)
    : null;
  console.log("CoverImage upload result:", coverImage);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  console.log("Creating user with data:", {
    fullName,
    email,
    username,
    avatar: avatar.url,
  });

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
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User created successfully", createdUser));
});

export { registerUser };
