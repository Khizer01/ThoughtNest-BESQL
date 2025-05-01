import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createComment = async (req, res, next) => {
  try {
    const { postID, text } = req.body;

    if (!postID || !text) {
      return res
        .status(400)
        .json({ message: "Post ID and comment text are required." });
    }

    const userName = await User.findById(req.user.id || req.user.userId).select("name");

    const newComment = await Comment.create({
      postID: postID,
      userName: userName.name,
      text: text,
    });

    const post = await Post.findByIdAndUpdate(postID, {
      $push: { comments: newComment._id },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    res
      .status(201)
      .json({ message: "Comment created successfully", data: newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editComments = async (req, res, next) => {
  try {
    const { text } = req.body;
    const id = req.params.id;

    const userName = await User.findById(req.user.id || req.user.userId).select("name");

    if (!text) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.userName !== userName.name) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment." });
    }

    comment.text = text;
    await comment.save();

    res
      .status(200)
      .json({ message: "Comment updated successfully.", data: comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postID: req.params.id })
      .populate("postID", "title")
      .select("userName text createdAt");

    if (comments.length === 0) {
      return res.status(404).json({ message: "No comments found." });
    }

    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userName = await User.findById(req.user.id || req.user.userId).select("name");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.userName !== userName.name) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    await Comment.findByIdAndDelete(req.params.id);

    await Post.findByIdAndUpdate(comment.postID, {
      $pull: { comments: req.params.id },
    });

    res.status(200).json({ message: "Comment deleted successfully." });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
