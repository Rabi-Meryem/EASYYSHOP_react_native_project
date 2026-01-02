const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

/* =========================
   🔹 CRÉER UN POST
========================= */
router.post("/", async (req, res) => {
  try {
    const { userId, username, userProfilePicture, category, images } = req.body;

    if (!userId || !username || !category || !images) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const post = new Post({
      userId,
      username,
      userProfilePicture,
      category,
      images,
    });

    await post.save();
    res.status(201).json({ message: "Post créé avec succès", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 TOUS LES POSTS (HOME)
========================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 POSTS D’UN UTILISATEUR (PROFIL)
========================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 LIKER / UNLIKER UN POST
========================= */
router.post("/like", async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 COMMENTER UN POST
========================= */
router.post("/comment", async (req, res) => {
  try {
    const { postId, userId, username, text } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    post.comments.push({ userId, username, text });
    await post.save();

    res.json({ comments: post.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 ENREGISTRER / RETIRER UN POST
========================= */
router.post("/save", async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const alreadySaved = post.savedBy.includes(userId);

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter(id => id !== userId);
    } else {
      post.savedBy.push(userId);
    }

    await post.save();
    res.json({ savedBy: post.savedBy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 SUPPRIMER UN POST (STORE OWNER)
========================= */
router.delete("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    await post.deleteOne();
    res.json({ message: "Post supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
