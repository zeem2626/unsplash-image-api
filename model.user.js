import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   fullname: {
      type: String,
      required: true,
   },
   username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
   },
   password: {
      type: String,
      required: true,
      trim: true,
   },
});

const User = mongoose.model("User", userSchema);

export { User };
