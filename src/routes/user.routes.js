import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, changeCurrentPassword, getCurrentUser, updateUserDetails, userAvatarUpdate, userCoverImageUpdate, getChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { isAuthorized } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverimage",
        maxCount:1
    }
]), registerUser);

router.route("/login").post(loginUser);

// restricted routes
router.route("/logout").post(isAuthorized, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(isAuthorized,changeCurrentPassword);
router.route("/current-user").get(isAuthorized,getCurrentUser);
router.route("/update-user").patch(isAuthorized,updateUserDetails);
router.route("/update-user-avatar").patch(isAuthorized, upload.single("avatar"), userAvatarUpdate);
router.route("/update-user-coverimage").patch(isAuthorized,upload.single("coverimage"),userCoverImageUpdate);
router.route("/c/:username").get(isAuthorized,getChannelProfile);
router.route("/history").get(isAuthorized,getWatchHistory);



export default router;