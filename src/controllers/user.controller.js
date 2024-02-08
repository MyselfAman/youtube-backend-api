import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"
async function genrateAccessAndRefreshToken(userId) {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false }); // won't validate for rest of the fields of user model
    return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullname, password } = req.body;

    if (
        [username, email, fullname, password].some(
            (element) => element?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All frields are required !");
    }

    // will check with thses two value
    const doesUserExist = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (doesUserExist) {
        throw new ApiError(400, "User already exits.");
    }

    let avatarLocalPath;
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    }
    if (
        req.files &&
        Array.isArray(req.files.coverimage) &&
        req.files.coverimage.length > 0
    ) {
        coverImageLocalPath = req.files.coverimage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatarUploadedOnCloudnary = await uploadCloudinary(avatarLocalPath);
    const coverImageUploadedOnCloudnary =
        await uploadCloudinary(coverImageLocalPath);

    if (!avatarUploadedOnCloudnary) {
        throw new ApiError(400, "Avar is required");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullname,
        avatar: avatarUploadedOnCloudnary.url,
        coverimage: coverImageUploadedOnCloudnary?.url || "",
    });

    const ifUserExists = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!ifUserExists) {
        throw new ApiError(500, "Something went wrong while creating user.");
    }

    res.status(201).json(
        new ApiResponse(201, ifUserExists, "User created successfully.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    console.log(email, username, password);
    if (email === "" && username === "")
        throw new ApiError(400, "Please provide either email or username.");

    if (password === "") throw new ApiError(400, "Please provide password");

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(400, "username or email doesn't exits");
    }

    const isPasswordVerified = await user.isPasswordCorrect(password);

    if (!isPasswordVerified) throw new ApiError(400, "Password is incorrect.");

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
        user._id
    );

    const options = {
        //  can be modified from server only
        httpOnly: true,
        secure: true,
    };

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged In"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }, // remove the field from document
        },
        { new: true }
    );

    const options = {
        //  can be modified from server only
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const givenRefreshToken =
        req.cookies.refreshToken ||
            req.get("Authorization")?.replace("Bearer ", "");

        if (!givenRefreshToken)
            throw new ApiError(400, "Refresh token not found in your browser");
        const decode = await jwt.verify(
            givenRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decode?._id);
        if (!user) throw new ApiError(400, "Invalid refresh token provided");

        if (user?.refreshToken !== givenRefreshToken)
            throw new ApiError(400, "Invalid refresh token provided");

        const { accessToken:newAccessToken, refreshToken: newRefreshToken } = await genrateAccessAndRefreshToken(user?._id);

        const options = {
            //  can be modified from server only
            httpOnly: true,
            secure: true,
        };
        res.status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
               new ApiResponse( 200,
                {  accessToken: newAccessToken,refreshToken: newRefreshToken },
                "Access token refreshed")
            );
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh Token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // 1. get old and new password
    // 2. validate & get user from db
    // 3. check oldpassword
    // 4. change the password

    const { newPassword, oldPassword } = req.body;

    if (newPassword === "" || oldPassword === "")
        throw new ApiError(400, "Please provide new password");

    const user = await User.findById(req.user?._id);
    if (!user)
        throw new ApiError(400, "Can't chnage password user doesn't exits");

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect)
        throw new ApiError(400, "Your old password is incorrect.");

    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, {}, "Password chnaged successfully.")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { currentUser: req.user }, "Current user")
    );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { email, fullname } = req.body;

    if (email === "" && fullname === "")
        throw new ApiError(400, "Please provide email & fullname");
    console.log("hi");
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { email : email, fullname: fullname },
        },
        { new: true }
    ).select("-password -refreshToken");
        console.log(user);
    if (!user) throw new ApiError(400, "user update failed, Try again later");

    res.status(200).json(new ApiResponse(200, { user }, "User updated"));
});

const userAvatarUpdate = asyncHandler(async (req, res) => {
    const avatarFilePath = req.file.path;

    if (!avatarFilePath) throw new ApiError(400, "File not found");

    const avatar = await uploadCloudinary(avatarFilePath);

    if (!avatar) throw new ApiError(400, "File is not uploaded, Try again");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(400, "File is not uploaded, Try again");

    res.status(200).json(
        new ApiResponse(200, {}, "Avatar updated successfully")
    );
});

const userCoverImageUpdate = asyncHandler(async (req, res) => {
    const coverImageFilePath = req.file.path;

    if (!coverImageFilePath) throw new ApiError(400, "File not found");

    const coverImage = await uploadCloudinary(coverImageFilePath);

    if (!coverImage) throw new ApiError(400, "File is not uploaded, Try again");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverimage: coverImage.url },
        },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(400, "File is not uploaded, Try again");

    res.status(200).json(
        new ApiResponse(200, {}, "Cover image updated successfully")
    );
});

const getChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) throw new ApiError(400, "Username s missing");

    const channel = await User.aggregate([
        // it return array
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                // used to add extra fields in whichever model we are applying aggrigate
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        // to apply condition
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                // fields which u wannna return
                fullname: 1,
                email: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverimage: 1,
            },
        },
    ]);

    if (!channel) throw new ApiError(400, "Channel doesn't exits.");

    res.status(200).json(new ApiResponse(200, channel[0], "fetched success"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {

            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        }
                    }
                ],
            }
        }
    ]);
    res.status(200).json(
        new ApiResponse(200, user[0].watchHistory, "watch history fetched")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    userAvatarUpdate,
    userCoverImageUpdate,
    getChannelProfile,
    getWatchHistory,
};
