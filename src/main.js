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
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

function displayMessage(elementId, msg) {
  const msgElem = document.getElementById(elementId);
  if (msgElem) {
    msgElem.textContent = msg;
  }
}

function setupDynamicNavbar() {
  const navAuthLinks = document.getElementById("nav-auth-links");
  if (!navAuthLinks) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      navAuthLinks.innerHTML = `
        <a href="index.html">Home</a>
        <a href="main.html">Main</a>
        <button id="logout-btn" style="background:none; border:none; color:#d1d5db; cursor:pointer; font-size:16px; margin-left:20px;">
          Logout
        </button>
      `;
      const logoutBtn = document.getElementById("logout-btn");
      logoutBtn.addEventListener("click", () => {
        signOut(auth)
          .then(() => {
            window.location.href = "login.html";
          })
          .catch((error) => {
            console.error("Logout error:", error.message);
          });
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

function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function signup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

function logout() {
  return signOut(auth);
}

onAuthStateChanged(auth, (user) => {});

document.addEventListener("DOMContentLoaded", () => {
  setupDynamicNavbar();

  // Login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;

      login(email, password)
        .then(() => {
          displayMessage("message", "Login successful!");
          window.location.href = "main.html";
        })
        .catch((error) => {
          displayMessage("message", `Login error: ${error.message}`);
        });
    });
  }

  // Signup form
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupForm.email.value;
      const password = signupForm.password.value;

      signup(email, password)
        .then(() => {
          displayMessage(
            "signup-message",
            "Signup successful! You can now log in."
          );
          window.location.href = "login.html";
        })
        .catch((error) => {
          displayMessage("signup-message", `Signup error: ${error.message}`);
        });
    });
  }

  // Password reset form
  const resetForm = document.getElementById("reset-password-form");
  if (resetForm) {
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = resetForm["reset-email"].value;

      sendPasswordResetEmail(auth, email)
        .then(() => {
          displayMessage(
            "reset-message",
            "Password reset email sent! Check your inbox."
          );
        })
        .catch((error) => {
          displayMessage("reset-message", `Error: ${error.message}`);
        });
    });
  }

  // Logout button on main.html
  const staticLogoutBtn = document.getElementById("logout-btn");
  if (staticLogoutBtn) {
    staticLogoutBtn.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Logout error:", error.message);
        });
    });
  }

  // Notification toggle logic
  const toggle = document.getElementById("notifications-toggle");
  const statusMessage = document.getElementById("status-message");

  if (toggle && statusMessage) {
    toggle.disabled = true;

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }

      try {
        const docRef = doc(
          db,
          "users",
          user.uid,
          "notificationSettings",
          "preferences"
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          toggle.checked = docSnap.data().enableNotifications || false;
        } else {
          toggle.checked = false;
        }
      } catch (error) {
        statusMessage.style.color = "red";
        statusMessage.textContent = "Error loading settings.";
        console.error(error);
      } finally {
        toggle.disabled = false;
      }
    });

    toggle.addEventListener("change", async () => {
      if (toggle.disabled) return;

      toggle.disabled = true;

      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to change notification settings.");
        toggle.checked = !toggle.checked;
        toggle.disabled = false;
        return;
      }

      try {
        const docRef = doc(
          db,
          "users",
          user.uid,
          "notificationSettings",
          "preferences"
        );
        await setDoc(docRef, { enableNotifications: toggle.checked });
        if (toggle.checked) {
          alert("You have enabled notifications for this site.");
        }
        statusMessage.style.color = "#1e3a8a";
        statusMessage.textContent = "Notification settings updated.";
      } catch (err) {
        alert("Failed to save settings. Please try again.");
        toggle.checked = !toggle.checked;
        statusMessage.style.color = "red";
        statusMessage.textContent = "Error saving settings.";
        console.error(err);
      } finally {
        toggle.disabled = false;
      }
    });
  }

  // Loads recent posts in dashboard
  const recentList = document.getElementById("recent-activity");
  if (recentList) {
    renderRecentFromFirestore();
  }

  loadRecentCards();
});

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

// Recent post for dashboard
async function renderRecentFromFirestore() {
  const list = document.getElementById("recent-activity");
  if (!list) return;

  list.innerHTML = `
    <li>
      <span class="dot"></span>
      <div>Loading posts...</div>
    </li>
  `;

  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(5));
    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = `
        <li>
          <span class="dot"></span>
          <div>No posts yet. Be the first to make one.</div>
        </li>
      `;
      return;
    }

    list.innerHTML = "";

    snap.forEach((docSnap) => {
      const p = docSnap.data();
      const title = p.title || "Untitled";
      const desc = p.description || "";
      const loc = p.location || "Unknown";
      const cat = p.category || "Other";
      const when = formatRelativeTime(p.createdAt);

      list.insertAdjacentHTML(
        "beforeend",
        `
          <li>
            <span class="dot"></span>
            <div>
              <strong>${title}</strong><br>
              <span style="color:#64748b; font-size:0.9rem;">
                ${loc} · ${cat} · ${when}
              </span><br>
              <span>${desc}</span>
            </div>
          </li>
        `
      );
    });
  } catch (err) {
    console.error("Error loading recent posts:", err);
    list.innerHTML = `
      <li>
        <span class="dot"></span>
        <div style="color:#b91c1c;">Could not load posts. Try again later.</div>
      </li>
    `;
  }
}

async function loadRecentCards() {
  const container = document.getElementById("auto-cards");
  if (!container) return;

  container.innerHTML = `<p style="color:#64748b;">Loading...</p>`;

  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(3));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p style="color:#64748b;">No recent items.</p>`;
      return;
    }

    container.innerHTML = "";

    snap.forEach((docSnap) => {
      const p = docSnap.data();
      const title = p.title || "Untitled Item";
      const desc = p.description || "";
      const loc = p.location || "Unknown";
      const cat = p.category || "Other";
      const when = formatRelativeTime(p.createdAt);

      const cardHTML = `
        <div class="info-card" data-location="${loc.toLowerCase()}">
          <h3>📍 ${title} • ${loc}</h3>
          <p>${desc}</p>
          <a href="search.html" class="btn more-info-btn">More Info</a>
        </div>
      `;

      container.insertAdjacentHTML("beforeend", cardHTML);
    });
  } catch (err) {
    console.error("Card load error:", err);
    container.innerHTML = `<p style="color:#b91c1c;">Failed to load cards.</p>`;
  }
}

import { initMap } from "../map.js";

window.addEventListener("DOMContentLoaded", () => {
  initMap();
});
