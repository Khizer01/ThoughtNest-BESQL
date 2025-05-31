import { sql, pool } from "../database/SQL.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const existUser = await pool
      .request()
      .input("id", sql.Int, req.user.id || req.user.userId)
      .execute("sp_fetchUser");

    const userName =
      existUser.recordset.length > 0 ? existUser.recordset[0] : null;

    await pool
      .request()
      .input("title", sql.VarChar, title)
      .input("content", sql.VarChar, content)
      .input("publisherId", sql.Int, req.user.id || req.user.userId)
      .input("publisherName", sql.VarChar, userName?.name)
      .input("publishedOn", sql.DateTime, new Date())
      .execute("sp_CreatePost");

    const newPost = await pool
      .request()
      .input("title", sql.VarChar, title)
      .input("publisherId", sql.Int, req.user.id || req.user.userId)
      .execute("sp_fetchCreatedPost");

    res.status(201).json({
      message: "Post created successfully",
      data: newPost.recordset[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const id = req.params.id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchPost");

    if (post.recordset.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.VarChar, title)
      .input("content", sql.VarChar, content)
      .input("publishedOn", sql.DateTime, new Date())
      .execute("sp_updatePost");

    const updatedPost = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchPost");

    res.status(200).json({
      message: "Post Updated Successfully",
      data: updatedPost.recordset[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existPost = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchPost");

    if (existPost.recordset.length === 0) {
      return res.status(404).json({
        message: "No post with such id found",
      });
    }

    const post = existPost.recordset[0];

    if (
      post.publisherId?.toString() !==
      (req.user?.id?.toString() || req.user?.userId?.toString())
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_deletePost");

    res.status(204).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const formatPostDate = (post) => ({
  ...post,
  publishedOn: post.publishedOn
    ? new Date(post.publishedOn).toISOString()
    : null,
});

export const getPost = async (req, res, next) => {
  try {
    const id = req.params.id;

    const post = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchPost");

    if (post.recordset.length === 0) {
      return res.status(404).json({
        message: "No post with such id found",
      });
    }

    post.recordset[0].publishedOn = new Date(
      post.recordset[0].publishedOn
    ).toISOString();

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await pool
      .request()
      .input("offset", sql.Int, skip)
      .input("limit", sql.Int, limit)
      .execute("sp_fetchOFFSetPost");

    const safePosts = result.recordset.map(formatPostDate);

    const totalPosts = await pool
      .request()
      .query("SELECT COUNT(*) AS total FROM Post");

    res.status(200).json({
      data: safePosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts.recordset[0].total / limit),
      totalPosts: totalPosts.recordset[0].total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
