// report.js — save post locally (no Firestore) then redirect to main.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Auth only (same config as main.js)
const firebaseConfig = {
  apiKey: "AIzaSyCA7rXIeGG7iP181YWpPXfjjQjKemmWfyw",
  authDomain: "lostnfound-67ee0.firebaseapp.com",
  projectId: "lostnfound-67ee0",
  storageBucket: "lostnfound-67ee0.appspot.com",
  messagingSenderId: "194790650701",
  appId: "1:194790650701:web:97d7fd597cb2350711bd04",
  measurementId: "G-LB257QGLV4",
};
initializeApp(firebaseConfig);
const auth = getAuth();

const $ = (s) => document.querySelector(s);
const msg = $("#form-msg");
const setMsg = (t, cls = "") => {
  if (msg) {
    msg.textContent = t;
    msg.className = `help ${cls}`;
  }
};

function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem("lnf_posts") || "[]");
  } catch {
    return [];
  }
}
function savePosts(arr) {
  localStorage.setItem("lnf_posts", JSON.stringify(arr));
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// optional auth guard (keep if you still use login)
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

const form = $("#report-form");
const submitBtn = $("#submit-btn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser; // can be null if you removed auth guard
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

    submitBtn.disabled = true;
    setMsg("Submitting…");

    try {
      let imageDataUrl = null;
      if (file) {
        // WARNING: localStorage has size limits; small images only
        imageDataUrl = await readFileAsDataURL(file);
      }

      const post = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title,
        description,
        category,
        location,
        status: "active",
        ownerUid: user?.uid || null,
        ownerEmail: user?.email || null,
        createdAt: new Date().toISOString(),
        imageUrl: imageDataUrl, // stored inline (optional)
      };

      const posts = loadPosts();
      posts.push(post);
      savePosts(posts);

      setMsg("Post submitted!", "ok");
      window.location.href = "main.html";
    } catch (err) {
      console.error(err);
      setMsg("Failed to submit. Please try again.", "err");
      submitBtn.disabled = false;
    }
  });
}
