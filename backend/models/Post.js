const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // firebaseUid
    username: { type: String, required: true },
    userProfilePicture: { type: String, default: "" },

    category: {
      type: String,
      enum: ["homme", "femme", "enfant"],
      required: true,
    },

    images: {
      type: [String],
      required: true,
    },

    likes: {
      type: [String], // firebaseUid
      default: [],
    },

    comments: [
      {
        userId: String,
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    savedBy: {
      type: [String], // firebaseUid
      default: [],
    },
  },
  { timestamps: true }
);

//module.exports = mongoose.model("Post", postSchema);
module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
