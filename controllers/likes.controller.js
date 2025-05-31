import { pool, sql } from "../database/SQL.js";

export const fetchLikes = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const likes = await pool
      .request()
      .input("postId", sql.Int, postId)
      .execute("sp_fetchSavedPosts");      

    if (likes.recordset.length === 0) {
      return res.status(404).json({ message: "No likes found for this post" });
    }


    const LikesCount = await pool
      .request()
      .input("postId", sql.Int, postId)
      .execute("sp_getSaveCount");

    res.status(200).json({
      message: "Likes fetched successfully",
      data: {likes: likes.recordset, count: LikesCount.recordset[0].LikeCount},
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const likes = await pool
      .request()
      .input("postId", sql.Int, postId)
      .input("userId", sql.Int, userId)
      .execute("sp_getAllSavePosts");

    if (likes.recordset.length !== 0) {
      return res.status(400).json({ message: "Post is already liked" });
    }

    await pool
      .request()
      .input("postId", sql.Int, postId)
      .input("userId", sql.Int, userId)
      .execute("sp_AddSavePost");
    

    res.status(200).json({
      message: "Like added successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const RemoveLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const isLiked = await pool
      .request()
      .input("postId", sql.Int, postId)
      .input("userId", sql.Int, userId)
      .execute("sp_getAllSavePosts");

    if (isLiked.recordset.length === 0) {
      return res.status(400).json({ message: "Post isn't liked" });
    }

    await pool
      .request()
      .input("postId", sql.Int, postId)
      .input("userId", sql.Int, userId)
      .execute("sp_RemSavePost");

    res.status(200).json({
      message: "Like Removed Successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
