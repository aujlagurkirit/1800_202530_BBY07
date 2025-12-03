// search.js — load posts from Firestore instead of localStorage

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Same config as main.js
const firebaseConfig = {
  apiKey: "AIzaSyCA7rXIeGG7iP181YWpPXfjjQjKemmWfyw",
  authDomain: "lostnfound-67ee0.firebaseapp.com",
  projectId: "lostnfound-67ee0",
  storageBucket: "lostnfound-67ee0.firebasestorage.app",
  messagingSenderId: "194790650701",
  appId: "1:194790650701:web:97d7fd597cb2350711bd04",
  measurementId: "G-LB257QGLV4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----- State -----
let allPosts = [];
let currentSort = "recent";

// ----- DOM -----
const sortOptions = document.querySelectorAll(".sort-card");
const searchInput = document.getElementById("searchInput");
const resultsInfo = document.getElementById("resultsInfo");
const resultsContainer = document.getElementById("resultsContainer");

// Modal elements
const postModal = document.getElementById("postModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalLocation = document.getElementById("modalLocation");
const modalCategory = document.getElementById("modalCategory");
const modalTime = document.getElementById("modalTime");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");

// Logout button
const staticLogoutBtn = document.getElementById("logout-btn");
if (staticLogoutBtn) {
  staticLogoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "login.html";
      })
      .catch((error) => console.error("Logout error:", error.message));
  });
}

// ----- Helpers -----
function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = (Date.now() - d.getTime()) / 1000;

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

function sortItems(list, sortKey) {
  const arr = [...list];
  if (sortKey === "recent") {
    return arr.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }
  if (sortKey === "oldest") {
    return arr.sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );
  }
  if (sortKey === "az") {
    return arr.sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", undefined, {
        sensitivity: "base",
      })
    );
  }
  if (sortKey === "za") {
    return arr.sort((a, b) =>
      (b.title || "").localeCompare(a.title || "", undefined, {
        sensitivity: "base",
      })
    );
  }
  return arr;
}

// ----- Card / Modal -----
function createResultCard(item) {
  const card = document.createElement("div");
  card.classList.add("result-card");

  const timeText = item.createdAt
    ? `Posted: ${new Date(item.createdAt).toLocaleString()}`
    : "";

  card.innerHTML = `
    <div class="result-top-row">
      <p class="result-name">${item.title || "Untitled"}</p>
      <p class="result-location">${item.location || "Unknown location"}</p>
    </div>
    <p class="result-desc">${item.description || ""}</p>
    <p class="result-time">${timeText}</p>
  `;

  card.addEventListener("click", () => {
    modalTitle.textContent = item.title || "Untitled";
    modalDesc.textContent = item.description || "";
    modalLocation.textContent = item.location || "Unknown location";
    modalCategory.textContent = item.category || "Other";
    modalTime.textContent = item.createdAt
      ? `${timeText} (${formatRelativeTime(item.createdAt)})`
      : "";

    if (item.imageUrl) {
      modalImage.src = item.imageUrl;
      modalImage.style.display = "block";
    } else {
      modalImage.style.display = "none";
    }

    postModal.style.display = "block";
  });

  return card;
}

function renderResults(list) {
  const sortedList = sortItems(list, currentSort);
  resultsContainer.innerHTML = "";

  if (!sortedList.length) {
    resultsInfo.textContent = "No matches found.";
    return;
  }

  resultsInfo.textContent = `${sortedList.length} item(s) found`;

  sortedList.forEach((item) => {
    resultsContainer.appendChild(createResultCard(item));
  });
}

// ----- Filter -----
function filterItems(query) {
  const q = query.toLowerCase().trim();

  if (q === "") {
    renderResults(allPosts);
    return;
  }

  const filtered = allPosts.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const loc = (item.location || "").toLowerCase();
    const cat = (item.category || "").toLowerCase();

    return (
      title.includes(q) ||
      desc.includes(q) ||
      loc.includes(q) ||
      cat.includes(q)
    );
  });

  renderResults(filtered);
}

// ----- Load from Firestore -----
async function loadPostsFromFirestore() {
  resultsInfo.textContent = "Loading posts...";

  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    allPosts = [];
    snap.forEach((docSnap) => {
      allPosts.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (!allPosts.length) {
      resultsInfo.textContent = "No posts yet. Be the first to make one.";
      resultsContainer.innerHTML = "";
      return;
    }

    renderResults(allPosts);
  } catch (err) {
    console.error("Error loading posts:", err);
    resultsInfo.textContent = "Could not load posts. Please try again later.";
  }
}

// ----- Event wiring -----
sortOptions.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("active");

    // If already active → unselect & reset sort
    if (wasActive) {
      card.classList.remove("active");
      currentSort = "recent"; // default
      renderResults(allPosts);
      return;
    }

    // Otherwise → activate this card
    sortOptions.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");

    currentSort = card.dataset.sort || "recent";
    filterItems(searchInput.value);
  });
});

// Modal close
if (modalClose) {
  modalClose.addEventListener("click", () => {
    postModal.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === postModal) {
    postModal.style.display = "none";
  }
});

// ----- Auth guard + initial load -----
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadPostsFromFirestore();
});
