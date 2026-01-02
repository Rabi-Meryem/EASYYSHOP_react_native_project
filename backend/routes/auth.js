const express = require("express");
const User = require("../models/user");

const router = express.Router();

// ✅ INSCRIPTION (profil seulement)
router.post("/signup", async (req, res) => {
  try {
    const { firebaseUid, name, email, profilePicture, role } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ message: "firebaseUid manquant" });
    }

    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const newUser = new User({
      firebaseUid,
      name,
      email,
      profilePicture: profilePicture || "",
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "Profil utilisateur créé",
      user: newUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ CONNEXION (récupérer le profil avec firebaseUid)
router.post("/signin", async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    res.json({
      message: "Connexion réussie",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ RÉCUPÉRER LE PROFIL (après login Firebase)
router.post("/profile", async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
