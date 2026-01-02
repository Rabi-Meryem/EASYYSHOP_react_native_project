const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const profileRoutes = require("./routes/profile");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de log des requêtes
app.use((req, res, next) => {
  console.log("Requête reçue :", req.method, req.url, req.body);
  next();
});

// Connexion MongoDB
const uri = process.env.MONGODB_URI || "mongodb+srv://meryem_monia:Ew8FjLsLh4t96O92@easyshop.aun0ckw.mongodb.net/easyshopDB?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("MongoDB connecté ✅"))
  .catch(err => console.log("Erreur MongoDB ❌", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profile", profileRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Backend fonctionne !");
});

// Middleware global de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${PORT}`);
});
