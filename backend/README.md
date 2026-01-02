# EASYSHOP 📱🛍️

EasyShop est une application mobile développée avec React Native (Expo) et Node.js.
Elle permet aux boutiques (store owners) de publier leurs produits et aux clients
de découvrir, liker et sauvegarder des publications.

##  Architecture
Le projet est divisé en deux parties :
- Frontend : React Native (Expo)
- Backend : Node.js + Express
- Authentification : Firebase Auth
- Base de données : MongoDB Atlas

##  Authentification
Firebase est utilisé uniquement pour :
- Connexion

Toutes les autres données sont stockées dans MongoDB.

##  Structure Frontend
src/
├── screens/
├── navigation/
├── services/
├── components/
└── App.js

##  Structure Backend
backend/
├── models/
├── routes/
├── server.js
└── .env

##  Types d’utilisateurs
- Client
- Store Owner

Chaque type possède une interface profil différente.

##  Fonctionnalités
- Authentification Firebase
- Home avec feed dynamique
- Likes, commentaires, sauvegarde
- Profil dynamique selon le rôle
- Publications avec images multiples

## Technologies
- React Native (Expo)
- Firebase Auth
- Node.js / Express
- MongoDB / Mongoose
