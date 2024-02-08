import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const isAuthorized = asyncHandler(async (req, res, next) => {
    try {
        const accessToken =
            req.cookies?.accessToken ||
            req.get("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(400, "Invalid Request");
        }
        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );
        if (!decoded) {
            throw new ApiError(400, "Invalid access token");
        }

        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );

        if (!user) throw new ApiError(400, "Invalid access token");

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export { isAuthorized };
