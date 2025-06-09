import { pool, sql } from "../database/SQL.js";

export const createComment = async (req, res, next) => {
  try {
    const { postID, text } = req.body;

    if (!postID || !text) {
      return res
        .status(400)
        .json({ message: "Post ID and comment text are required." });
    }

    const post = await pool
      .request()
      .input("id", sql.Int, postID)
      .execute("sp_fetchPost");

    if (post.recordset.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    const userName = await pool
      .request()
      .input("id", sql.Int, req.user?.id || req.user?.userId)
      .execute("sp_fetchUserName");

    const newComment = await pool
      .request()
      .input("postID", sql.Int, postID)
      .input("text", sql.VarChar, text)
      .input("userName", sql.VarChar, userName.recordset[0].name)
      .execute("sp_CreateComment");



    const rawComment = newComment.recordset[0];
    const isoComment = {
      ...rawComment,
      createdAt: rawComment.createdAt.toISOString(),
    };
    res.status(201).json({
      message: "Comment created successfully",
      data: isoComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editComments = async (req, res, next) => {
  try {
    const { text } = req.body;
    const id = req.params.id;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const userName = await pool
      .request()
      .input("id", sql.Int, req.user?.id || req.user?.userId)
      .execute("sp_fetchUserName");

    const comment = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchCommentWId");

    if (comment.recordset.length === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.recordset[0].userName !== userName.recordset[0].name) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment." });
    }

    if (comment.recordset[0].text === text) {
      return res.status(400).json({ message: "No changes detected." });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("text", sql.VarChar, text)
      .input("createdAt", sql.DateTime, new Date())
      .execute("sp_UpdateComment");

    const updatedComment = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchCommentWId");
    

    res.status(200).json({
      message: "Comment updated successfully.",
      data: updatedComment.recordset[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const formatCommentDate = (comment) => ({
  ...comment,
  createdAt: comment.createdAt
    ? new Date(comment.createdAt).toISOString()
    : null,
});

export const getComments = async (req, res, next) => {
  try {
    const comments = await pool
      .request()
      .input("postID", sql.Int, req.params.id)
      .execute("sp_fetchCommentForPost");

    if (comments.recordset.length === 0) {
      return res.status(404).json({ message: "No comments found." });
    }

    const safeComments = comments.recordset.map(formatCommentDate);

    res.status(200).json({ data: safeComments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .execute("sp_fetchCommentWId");

    if (comment.recordset.length === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const userName = await pool
      .request()
      .input("id", sql.Int, req.user.id || req.user.userId)
      .execute("sp_fetchUserName");

    if (comment.recordset[0].userName !== userName.recordset[0].name) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .execute("sp_DeleteComment");

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
