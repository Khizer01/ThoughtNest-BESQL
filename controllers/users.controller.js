import bcrypt from "bcryptjs";
import { sql, pool } from "../database/SQL.js";

export const editUser = async (req, res) => {
  try {
    const { name, avatar, password, oldPassword } = req.body;
    const id = req.params.id;
    const userId = req.user?.id || req.user?.userId;
    
    if (id.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Unauthorized Access Denied" });
    }

    const existUser = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_fetchUser");
      
      
      const user = existUser.recordset.length !== 0 ? existUser.recordset[0] : null;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedName = name || user.name;
    const updatedAvatar = avatar || user.avatar;
    let updatedPassword = user.password;

    
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old Password is required" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Old Password" });
      }

      updatedPassword = await bcrypt.hash(password, 10);
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.VarChar, updatedName)
      .input("avatar", sql.VarChar, updatedAvatar)
      .input("password", sql.VarChar, updatedPassword)
      .execute("sp_updateUser");

    res.status(200).json({
      message: "User updated successfully",
      data: {
        id: user.id,
        name: updatedName,
        email: user.email,
        avatar: updatedAvatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
