import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAabMApKqbirMcR4IwvahY3HpYyD-djsdQ",
  authDomain: "giving-tree-w41pj.firebaseapp.com",
  databaseURL: "https://giving-tree-w41pj-default-rtdb.firebaseio.com",
  projectId: "giving-tree-w41pj",
  storageBucket: "giving-tree-w41pj.firebasestorage.app",
  messagingSenderId: "378231472140",
  appId: "1:378231472140:web:15c4415cb44fc5093fee29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app; 