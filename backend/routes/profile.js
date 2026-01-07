const express = require("express");
const router = express.Router();
const User = require("../models/user");
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
router.put("/update", async (req, res) => {
  try {
    const { firebaseUid, name, bio, profilePicture } = req.body;
  //  if (!firebaseUid) return res.status(400).json({ message: 'UID manquant' });
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // mise à jour
    /*if (name) user.name = name;
    if (bio ) user.bio = bio;
    if (profilePicture ) user.profilePicture = profilePicture;
*/
user.name = name;
    user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture; // base64
    await user.save();
      
    res.json({
      message: "Profil mis à jour avec succès",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
