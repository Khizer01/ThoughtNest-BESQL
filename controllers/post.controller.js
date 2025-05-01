import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import DOMPurify from "dompurify";

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // const safeContent = DOMPurify.sanitize(content);

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    const userName = await User.findById(req.user.id || req.user.userId).select("name");

    const newPost = await Post.create({
      title,
      content,
      publisherId: req.user.id || req.user.userId,
      publisherName: userName?.name,
    });

    res.status(201).json({
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // const safeContent = DOMPurify.sanitize(content);

    const id = req.params.id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = await Post.findByIdAndUpdate(id, {
      title: title,
      content: content,
    }, { new: true, runValidators: true });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post Updated Successfully",
      data: post,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById({ _id: id });
    if (!post) {
      return res.status(404).json({
        message: "No post with such id found",
      });
    }

    if (post.publisherId?.toString() !== (req.user?.id?.toString() || req.user?.userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({postID: post._id});

    res.status(204).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        message: "No post with such id found",
      });
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    // Get query params for pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 posts
    const skip = (page - 1) * limit;

    // Fetch posts with pagination and sorting
    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by latest posts

    // Get total count for frontend pagination
    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      data: posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
