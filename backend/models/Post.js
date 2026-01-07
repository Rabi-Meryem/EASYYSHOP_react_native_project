const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // 🔐 Lien avec Firebase
    userId: { type: String, required: true }, // firebaseUid
    username: { type: String, required: true },
    userProfilePicture: { type: String, default: "" },

    // 🔎 Filtrage Home
    category: {
      type: String,
      enum: ["homme", "femme", "enfant"],
      required: true,
    },

    // 🖼️ Images (base64)
    images: {
      type: [String],
      required: true,
    },

    // 📝 Description type Instagram
    description: {
      type: String,
      required:  [true, "Description obligatoire"],
      trim: true 
    },

    // ❤️ Likes
    likes: {
      type: [String], // firebaseUid
      default: [],
    },

    // 💬 Commentaires
    comments: {
      type: [
      {
        userId: String,
        username: String,
         userAvatar: { type: String, default: "" }, // <- ajoute ceci
        text: String,
        createdAt: { type: Date, default: Date.now },
      }
       ],
       default: [],
      },
    

    // 🔖 Enregistré
    savedBy: {
      type: [String], // firebaseUid
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
