const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

/**
 * 🔹 Récupérer le profil utilisateur
 * body: { firebaseUid }
 */
router.post("/me", async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    const user = await User.findOne({ firebaseUid }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const postsCount = await Post.countDocuments({ userId: firebaseUid });

    res.json({
      user,
      stats: {
        followers: user.followers.length,
        following: user.followingStores.length,
        posts: postsCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * 🔹 Récupérer les posts d’un utilisateur
 */
router.get("/posts/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const posts = await Post.find({ userId: firebaseUid }).sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
