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
});

// ===== Dashboard wiring =====
const greetEl = document.getElementById("dash-greeting");
const aEl = (id) => document.getElementById(id);

function setDemoStatsAndActivity() {
  aEl("stat-active") && (aEl("stat-active").textContent = "2");
  aEl("stat-returned") && (aEl("stat-returned").textContent = "1");
  aEl("stat-community") && (aEl("stat-community").textContent = "14");
  aEl("stat-matches") && (aEl("stat-matches").textContent = "3");
  const list = document.getElementById("recent-activity");
  if (list) {
    list.innerHTML = `
      <li><span class="dot"></span> You updated <strong>“Blue Hydroflask”</strong> · 2h ago</li>
      <li><span class="dot"></span> Match found on <strong>“AirPods Case”</strong> · 6h ago</li>
      <li><span class="dot"></span> You posted <strong>“BCIT ID Card”</strong> · yesterday</li>
    `;
  }
}

// If you already have onAuthStateChanged(auth, cb) call:
//   inside the "user is logged in" branch, set the greeting and call setDemoStatsAndActivity().
// Otherwise, do a simple fallback:
try {
  // If your auth listener sets window.currentUser, use that name/email
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
