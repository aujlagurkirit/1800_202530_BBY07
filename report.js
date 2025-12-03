// report.js — save post to Firestore, then redirect to main.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Same config as main.js
const firebaseConfig = {
  apiKey: "AIzaSyCA7rXIeGG7iP181YWpPXfjjQjKemmWfyw",
  authDomain: "lostnfound-67ee0.firebaseapp.com",
  projectId: "lostnfound-67ee0",
  storageBucket: "lostnfound-67ee0.appspot.com",
  messagingSenderId: "194790650701",
  appId: "1:194790650701:web:97d7fd597cb2350711bd04",
  measurementId: "G-LB257QGLV4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (s) => document.querySelector(s);
const msg = $("#form-msg");
const setMsg = (t, cls = "") => {
  if (msg) {
    msg.textContent = t;
    msg.className = `help ${cls}`;
  }
};

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// Require login for this page
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

const form = $("#report-form");
const submitBtn = $("#submit-btn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    const title = $("#title").value.trim();
    const description = $("#description").value.trim();
    const category = $("#category").value;
    const location = $("#location").value.trim();
    const file = /** @type {HTMLInputElement} */ (
      document.getElementById("photo")
    ).files?.[0];

    if (!title || !description || !category || !location) {
      setMsg("Please fill all required fields.", "err");
      return;
    }

    if (!user) {
      setMsg("You must be logged in to submit a post.", "err");
      return;
    }

    submitBtn.disabled = true;
    setMsg("Submitting…");

    try {
      let imageDataUrl = null;
      if (file) {
        // NOTE: Firestore has size limits; use small images for this project
        imageDataUrl = await readFileAsDataURL(file);
      }

      const post = {
        title,
        description,
        category,
        location,
        status: "active",
        ownerUid: user.uid,
        ownerEmail: user.email || null,
        createdAt: new Date().toISOString(), // stored as ISO string for easy sorting
        imageUrl: imageDataUrl, // optional
      };

      await addDoc(collection(db, "posts"), post);

      setMsg("Post submitted!", "ok");
      window.location.href = "main.html";
    } catch (err) {
      console.error(err);
      setMsg("Failed to submit. Please try again.", "err");
      submitBtn.disabled = false;
    }
  });
}
