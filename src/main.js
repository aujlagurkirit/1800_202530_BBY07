// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// =============================
// Firebase Initialization
// =============================
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

// Utility for messages
function displayMessage(elementId, msg) {
  const msgElem = document.getElementById(elementId);
  if (msgElem) msgElem.textContent = msg;
}

// =============================
// Dynamic Navbar (Auth based)
// =============================
function setupDynamicNavbar() {
  const navAuthLinks = document.getElementById("nav-auth-links");
  if (!navAuthLinks) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      navAuthLinks.innerHTML = `
        <a href="index.html">Home</a>
        <a href="main.html">Main</a>
        <button id="logout-btn" style="background:none; border:none; color:#d1d5db;">
          Logout
        </button>
      `;
      document.getElementById("logout-btn").addEventListener("click", () => {
        signOut(auth).then(() => (window.location.href = "login.html"));
      });
    } else {
      navAuthLinks.innerHTML = `
        <a href="index.html">Home</a>
        <a href="login.html">Login</a>
        <a href="signup.html">Sign Up</a>
      `;
    }
  });
}

// Authentication helpers
function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function signup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

function logout() {
  return signOut(auth);
}

// =============================
// DOMContentLoaded MAIN BLOCK
// =============================
document.addEventListener("DOMContentLoaded", () => {
  setupDynamicNavbar();

  // ---------------------------
  // Login Form
  // ---------------------------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      login(loginForm.email.value, loginForm.password.value)
        .then(() => (window.location.href = "main.html"))
        .catch((err) => displayMessage("message", err.message));
    });
  }

  // ---------------------------
  // Signup Form
  // ---------------------------
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      signup(signupForm.email.value, signupForm.password.value)
        .then(() => (window.location.href = "login.html"))
        .catch((err) => displayMessage("signup-message", err.message));
    });
  }

  // ---------------------------
  // Password Reset
  // ---------------------------
  const resetForm = document.getElementById("reset-password-form");
  if (resetForm) {
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sendPasswordResetEmail(auth, resetForm["reset-email"].value)
        .then(() =>
          displayMessage("reset-message", "Password reset email sent!")
        )
        .catch((err) => displayMessage("reset-message", err.message));
    });
  }

  // ---------------------------
  // Static Logout Button
  // ---------------------------
  const staticLogoutBtn = document.getElementById("logout-btn");
  if (staticLogoutBtn) {
    staticLogoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => (window.location.href = "login.html"));
    });
  }

  // ---------------------------
  // Notifications Toggle
  // ---------------------------
  const toggle = document.getElementById("notifications-toggle");
  const statusMessage = document.getElementById("status-message");

  if (toggle && statusMessage) {
    toggle.disabled = true;

    onAuthStateChanged(auth, async (user) => {
      if (!user) return (window.location.href = "login.html");

      try {
        const ref = doc(
          db,
          "users",
          user.uid,
          "notificationSettings",
          "preferences"
        );
        const snap = await getDoc(ref);
        toggle.checked = snap.exists()
          ? snap.data().enableNotifications
          : false;
      } catch {
        statusMessage.textContent = "Error loading settings.";
      } finally {
        toggle.disabled = false;
      }
    });

    toggle.addEventListener("change", async () => {
      const user = auth.currentUser;
      if (!user) return alert("Must be logged in!");

      toggle.disabled = true;
      const ref = doc(
        db,
        "users",
        user.uid,
        "notificationSettings",
        "preferences"
      );

      try {
        await setDoc(ref, { enableNotifications: toggle.checked });
        statusMessage.textContent = "Settings updated.";
      } catch {
        statusMessage.textContent = "Error saving.";
        toggle.checked = !toggle.checked;
      } finally {
        toggle.disabled = false;
      }
    });
  }

  // ---------------------------
  // Recent Posts Rendering
  // ---------------------------
  const recentList = document.getElementById("recent-activity");
  if (recentList) renderRecentFromStorage();
});

// =============================
// Recent Posts (LocalStorage)
// =============================
function loadPostsFromStorage() {
  try {
    const raw = localStorage.getItem("lnf_posts");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];
  } catch {
    return [];
  }
}

function formatRelativeTime(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function renderRecentFromStorage() {
  const list = document.getElementById("recent-activity");
  if (!list) return;

  const posts = loadPostsFromStorage();
  if (!posts.length) {
    list.innerHTML = `<li><span class="dot"></span>No posts yet.</li>`;
    return;
  }

  list.innerHTML = "";
  posts.slice(0, 5).forEach((p) => {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <li>
        <span class="dot"></span>
        <div>
          <strong>${p.title}</strong><br>
          <span style="color:#64748b">${p.location} · ${formatRelativeTime(
        p.createdAt
      )}</span><br>
          <span>${p.description}</span>
        </div>
      </li>
    `
    );
  });
}

// =============================
// Profile Page Logic
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profile-form");
  const editBtn = document.getElementById("edit-btn");
  if (!profileForm || !editBtn) return;

  const msg = document.createElement("p");
  profileForm.parentNode.insertBefore(msg, profileForm.nextSibling);

  const usernameInput = profileForm.username;
  const emailInput = profileForm.email;
  const phoneInput = profileForm.phone;

  function setDisabled(d) {
    usernameInput.disabled = d;
    emailInput.disabled = d;
    phoneInput.disabled = d;
  }

  setDisabled(true);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      msg.textContent = "You must be logged in.";
      profileForm.style.display = "none";
      editBtn.style.display = "none";
      return;
    }

    const ref = doc(db, "profiles", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      usernameInput.value = data.username || "";
      emailInput.value = data.email || "";
      phoneInput.value = data.phone || "";
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  });

  editBtn.addEventListener("click", () => {
    if (usernameInput.disabled) {
      setDisabled(false);
      editBtn.textContent = "Cancel";
    } else {
      setDisabled(true);
      editBtn.textContent = "Edit";
    }
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "profiles", user.uid);
    await setDoc(ref, {
      username: usernameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
    });

    msg.textContent = "Saved!";
    msg.style.color = "green";
    setDisabled(true);
    editBtn.textContent = "Edit";
  });
});

// ========================================================================
// =======================  GOOGLE MAPS (GLOBAL!) =========================
// ========================================================================

let map;
let markers = {};
let infoWindow;

function initMap() {
  const defaultCenter = { lat: 49.2502, lng: -123.0018 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 16,
    mapTypeControl: false,
    streetViewControl: false,
  });

  infoWindow = new google.maps.InfoWindow();

  const locations = {
    sw01: {
      position: { lat: 49.25127479449927, lng: -123.0024951386435 },
      name: "BCIT Safety & Security",
      details: "Main Lost & Found Desk — open weekdays 9 AM to 5 PM.",
    },
    library: {
      position: { lat: 49.24948329688611, lng: -123.00087181847898 },
      name: "BCIT Library",
      details: "Items found in study areas or computer labs are stored here.",
    },
    gymnasium: {
      position: { lat: 49.248849177397794, lng: -123.00089677386947 },
      name: "BCIT Gymnasium",
      details: "Lost personal items from fitness areas and locker rooms.",
    },
  };

  for (const key in locations) {
    const loc = locations[key];
    const marker = new google.maps.Marker({
      position: loc.position,
      map,
      title: loc.name,
    });

    marker.addListener("click", () => {
      infoWindow.setContent(`<b>${loc.name}</b><br>${loc.details}`);
      infoWindow.open(map, marker);
      map.panTo(loc.position);

      if (confirm(`Open Google Maps directions to ${loc.name}?`)) {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${loc.position.lat},${loc.position.lng}`,
          "_blank"
        );
      }
    });

    markers[key] = marker;
  }

  document.querySelectorAll(".info-card").forEach((card) => {
    card.addEventListener("click", () => {
      focusLocation(card.dataset.location);
    });
  });
}

function focusLocation(id) {
  const marker = markers[id];
  if (!marker) return;

  const position = marker.getPosition();
  map.panTo(position);
  map.setZoom(18);

  infoWindow.setContent(`<b>${marker.title}</b>`);
  infoWindow.open(map, marker);
}

window.initMap = initMap;
