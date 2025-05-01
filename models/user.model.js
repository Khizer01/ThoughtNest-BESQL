import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        min: [3, "Name must be at least 3 characters long"]
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please enter a valid email"]
    },
    avatar: {
        type: String,
        required: false,
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        min: [6, "Password must be at least 6 characters long"]
    },
    resetPassToken: {
        type: String,
        default: "",
    },
    resetPassExpire: {
        type: Date,
    },
}, {timestamps: true});


UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})


const User = mongoose.model("User", UserSchema);

export default User;