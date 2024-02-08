import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
const app = express();

app.use(express.json({limit:"16kb"})); // to allow express to accept json data
app.use(express.urlencoded({extended:true, limit:"16kb"})); // to allow express to to accepted nested object
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// router setup
import userRouter from "./routes/user.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import commentRouter from "./routes/comment.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"

// after this endpoint userRouter will take control
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/aubscription", subscriptionRouter);
app.use("/api/v1/video", videoRouter
);




export { app }