import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const editUser = async (req, res) => {
    try {
        const { name, avatar, password, oldPassword } = req.body;
        const id = req.params.id;
        
        if(id !== req.user.userId) {
            return res.status(401).json({message: "Unauthorized Access Denied"});
        }

        const user = await User.findById(id);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

       if(name) user.name = name;
       if(avatar) user.avatar = avatar;
       if(password) {
            if(!oldPassword) {
                return res.status(400).json({message: "Old Password is required"});
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if(!isMatch) {
                return res.status(400).json({message: "Invalid Old Password"});
            }
            user.password = password;
        }
        await user.save();
        res.status(200).json({message: "User updated successfully", data: {name: user.name, email: user.email, id: user._id, avatar: user.avatar}});

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
};