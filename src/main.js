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

onAuthStateChanged(auth, (user) => {
  // You can place page-wide logic here if needed
});

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

  // Logout button on main.html (static navbar version)
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
    toggle.disabled = true; // disable toggle until loaded

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
        toggle.disabled = false; // enable toggle after loading
      }
    });

    toggle.addEventListener("change", async () => {
      if (toggle.disabled) return; // ignore if disabled

      toggle.disabled = true; // disable during save

      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to change notification settings.");
        toggle.checked = !toggle.checked; // revert UI
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
        toggle.checked = !toggle.checked; // revert UI
        statusMessage.style.color = "red";
        statusMessage.textContent = "Error saving settings.";
        console.error(err);
      } finally {
        toggle.disabled = false; // re-enable toggle
      }
    });
  }

  // === NEW: load recent posts on main dashboard from localStorage ===
  const recentList = document.getElementById("recent-activity");
  if (recentList) {
    renderRecentFromFirestore();
  }
});

// ===== Dashboard wiring =====
const greetEl = document.getElementById("dash-greeting");
const aEl = (id) => document.getElementById(id);

// we keep stats as demo; don't touch Recent Posts here
function setDemoStatsAndActivity() {
  aEl("stat-active") && (aEl("stat-active").textContent = "2");
  aEl("stat-returned") && (aEl("stat-returned").textContent = "1");
  aEl("stat-community") && (aEl("stat-community").textContent = "14");
  aEl("stat-matches") && (aEl("stat-matches").textContent = "3");
}

try {
  const name =
    (window.currentUser &&
      (window.currentUser.displayName ||
        window.currentUser.email?.split("@")[0])) ||
    "there";
  if (greetEl) greetEl.textContent = `Welcome, ${name}!`;
  setDemoStatsAndActivity();
} catch (e) {
  if (greetEl) greetEl.textContent = "Welcome!";
  setDemoStatsAndActivity();
}

// POSTS from firestore

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

// ---------- Recent Posts from Firestore ----------
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
      const loc = p.location || "Unknown location";
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

// -------------------------------
// Profile Form Logic
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profile-form");
  if (!profileForm) return; // Exit if form not found

  const message = document.createElement("p");
  profileForm.parentNode.insertBefore(message, profileForm.nextSibling);

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      message.textContent = "You must be logged in to save your profile.";
      message.style.color = "red";
      return;
    }

    const username = profileForm.username.value.trim();
    const email = profileForm.email.value.trim();
    const phone = profileForm.phone.value.trim();

    if (!username || !email || !phone) {
      message.textContent = "Please fill in all fields.";
      message.style.color = "red";
      return;
    }

    const profileData = { username, email, phone };

    try {
      // Save profile data in Firestore under 'profiles/{uid}'
      await setDoc(doc(db, "profiles", user.uid), profileData);

      message.textContent = "Profile saved successfully!";
      message.style.color = "green";
      profileForm.reset();
    } catch (error) {
      message.textContent = "Error saving profile: " + error.message;
      message.style.color = "red";
      console.error("Firestore Error:", error);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profile-form");
  const editBtn = document.getElementById("edit-btn");

  if (!profileForm || !editBtn) return;

  const message = document.createElement("p");
  profileForm.parentNode.insertBefore(message, profileForm.nextSibling);

  const usernameInput = profileForm.username;
  const emailInput = profileForm.email;
  const phoneInput = profileForm.phone;

  const auth2 = getAuth();
  const db2 = getFirestore();

  // Enable/disable inputs (lock/unlock)
  function setInputsDisabled(disabled) {
    usernameInput.disabled = disabled;
    emailInput.disabled = disabled;
    phoneInput.disabled = disabled;
  }

  // Initially lock the inputs
  setInputsDisabled(true);

  // Load saved profile on page load
  onAuthStateChanged(auth2, async (user) => {
    if (!user) {
      message.textContent = "You must be logged in to view profile.";
      message.style.color = "red";
      setInputsDisabled(true);
      profileForm.style.display = "none";
      editBtn.style.display = "none";
      return;
    }

    profileForm.style.display = "block";
    editBtn.style.display = "inline-block";

    try {
      const docRef = doc(db2, "profiles", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        usernameInput.value = data.username || "";
        emailInput.value = data.email || "";
        phoneInput.value = data.phone || "";
        setInputsDisabled(true);
      } else {
        // No data yet, allow user to fill form
        setInputsDisabled(false);
      }
    } catch (error) {
      message.textContent = "Error loading profile: " + error.message;
      message.style.color = "red";
    }
  });

  // Edit button toggles input enabled state
  editBtn.addEventListener("click", () => {
    if (usernameInput.disabled) {
      // Unlock inputs to edit
      setInputsDisabled(false);
      editBtn.textContent = "Cancel";
    } else {
      // Cancel editing: reload data and lock inputs
      onAuthStateChanged(auth2, async (user) => {
        if (!user) return;

        const docRef = doc(db2, "profiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          usernameInput.value = data.username || "";
          emailInput.value = data.email || "";
          phoneInput.value = data.phone || "";
        } else {
          usernameInput.value = "";
          emailInput.value = "";
          phoneInput.value = "";
        }

        setInputsDisabled(true);
        editBtn.textContent = "Edit";
        message.textContent = "";
      });
    }
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth2.currentUser;
    if (!user) {
      message.textContent = "You must be logged in to save your profile.";
      message.style.color = "red";
      return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!username || !email || !phone) {
      message.textContent = "Please fill in all fields.";
      message.style.color = "red";
      return;
    }

    const profileData = { username, email, phone };

    try {
      await setDoc(doc(db2, "profiles", user.uid), profileData);
      message.textContent = "Profile saved successfully!";
      message.style.color = "green";
      setInputsDisabled(true);
      editBtn.textContent = "Edit";
    } catch (error) {
      message.textContent = "Error saving profile: " + error.message;
      message.style.color = "red";
      console.error(error);
    }
  });
});

import { initMap } from "../map.js";

window.addEventListener("DOMContentLoaded", () => {
  initMap();
});
