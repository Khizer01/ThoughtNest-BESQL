import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        min: [3, "Minimum 3 characters are required for title."],
        max: [100, "Maximum 100 characters are allowed for title."]
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        min: [200, "Minimum 200 characters are required for content."],
        max: [2000, "Maximum 2000 characters are allowed for content."]
    },
    publisherId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    publisherName: {
        type: String,
        required: [true, "Publisher name is required"]
    },
    publishedOn: {
        type: Date,
        default: Date.now(),
    },
    comments: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
  ],
},{timestamps: true});

const Post = mongoose.model("Post", postSchema);

export default Post;