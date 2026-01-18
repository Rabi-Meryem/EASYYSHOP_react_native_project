const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/user");

/* =========================
   🔹 CRÉER UN POST
========================= */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      username,
      userProfilePicture,
      category,
      images,
      description,
    } = req.body;

    if (!userId || !username || !category || !images || !description) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const post = new Post({
      userId,
      username,
      userProfilePicture,
      category,
      images,
      description,
      comments: [],
      commentsCount: 0,
      likes: [],
    });

    await post.save();
    res.status(201).json({ post });
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
    const posts = await Post.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔹 LIKE / UNLIKE
========================= */
router.post("/like", async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const index = post.likes.indexOf(userId);

    if (index >= 0) {
      post.likes.splice(index, 1);
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
   🔹 COMMENTER
========================= */
router.post("/comment", async (req, res) => {
  try {
    const { postId, userId, text } = req.body;

    if (!text) return res.status(400).json({ message: "Commentaire vide" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    // 🔥 récupérer l'utilisateur depuis MongoDB
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    post.comments.push({
      userId,
      username: user.name,
      userAvatar: user.profilePicture || "",
      text,
      createdAt: new Date(),
    });

    post.commentsCount = post.comments.length;
    await post.save();

    res.json({ comments: post.comments, commentsCount: post.commentsCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* =========================
   🔹 SUPPRIMER COMMENTAIRE
========================= */
router.post("/delete-comment", async (req, res) => {
  try {
    const { postId, commentId, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    // Supprimer seulement si c’est le commentaire de l’utilisateur
    post.comments = post.comments.filter(
      (c) => !(c._id.toString() === commentId && c.userId === userId)
    );

    post.commentsCount = post.comments.length;
    await post.save();

    res.json({ comments: post.comments, commentsCount: post.commentsCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Dans votre fichier de routes (ex: routes/posts.js)
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire du post
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce post' });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: 'Post supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du post' });
  }
});

module.exports = router;
