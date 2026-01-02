// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp9lCwttkbYxS2gHQQ5V0IrcjEXOS-QLc",
  authDomain: "easyshop-da665.firebaseapp.com",
  projectId: "easyshop-da665",
  storageBucket: "easyshop-da665.firebasestorage.app",
  messagingSenderId: "862981589236",
  appId: "1:862981589236:web:a212fbdedfac8cdfdd76a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const API_URL = "http://192.168.8.184:5000/api";
export const getPosts = () => fetch(`${API_URL}/posts`).then(res => res.json());
export const likePost = (postId, userId) =>
  fetch(`${API_URL}/posts/${postId}/like`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId}) });
export const commentPost = (postId, userId, text) =>
  fetch(`${API_URL}/posts/${postId}/comment`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId, text}) });
export const savePost = (postId, userId) =>
  fetch(`${API_URL}/posts/${postId}/save`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId}) });
