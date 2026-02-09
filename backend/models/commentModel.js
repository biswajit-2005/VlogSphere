import mongoose from "mongoose";

const comment = mongoose.Schema({
  vlog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vlog",
    required: true,
  },
  text: [
    {
      type: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
});

const Comment = mongoose.model("Comment", comment);
export default Comment;
