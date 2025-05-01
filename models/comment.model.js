import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "Post ID is required"]
    },
    userName: {
        type: String,
        required: [true, "User name is required"],
    },
    text: {
        type: String,
        required: [true, "Comment text is required"],
        min: [5, "Minimum 3 characters are required for comment text."],
        max: [250, "Maximum 250 characters are allowed for comment text."]
    }
}, {timestamps: true});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;