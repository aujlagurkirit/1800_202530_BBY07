let currentSort = "recent"; // default sort

const sortOptions = document.querySelectorAll(".sort-card");

sortOptions.forEach((card) => {
  card.addEventListener("click", () => {
    // remove active from all
    sortOptions.forEach((c) => c.classList.remove("active"));
    // add active to clicked card
    card.classList.add("active");

    // update current sort
    currentSort = card.dataset.sort;

    // re-render posts with current filter and sort
    filterItems(searchInput.value);
  });
});

function renderResults(list) {
  // sort based on currentSort
  const sortedList = sortItems(list, currentSort);

  resultsContainer.innerHTML = "";

  if (sortedList.length === 0) {
    resultsInfo.textContent = "No matches found.";
    return;
  }

  resultsInfo.textContent = `${sortedList.length} item(s) found`;

  sortedList.forEach((item) => {
    resultsContainer.appendChild(createResultCard(item));
  });
}

// ---------------------------
// Load posts from localStorage
// ---------------------------
let lostItems = JSON.parse(localStorage.getItem("lnf_posts")) || [];

// DOM elements
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

// ---------------------------
// Create one result card
// ---------------------------
function createResultCard(item) {
  const card = document.createElement("div");
  card.classList.add("result-card");

  const timeText = item.createdAt
    ? `Posted: ${new Date(item.createdAt).toLocaleString()}`
    : "";

  card.innerHTML = `
    <div class="result-top-row">
      <p class="result-name">${item.title}</p>
      <p class="result-location">${item.location}</p>
    </div>
    <p class="result-desc">${item.description}</p>
    <p class="result-time">${timeText}</p>
  `;

  // ---------------------------
  // Open modal on click
  // ---------------------------
  card.addEventListener("click", () => {
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.description;
    modalLocation.textContent = item.location;
    modalCategory.textContent = item.category;
    modalTime.textContent = timeText;

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

// ---------------------------
// Render list of results
// ---------------------------
function renderResults(list) {
  resultsContainer.innerHTML = "";

  if (list.length === 0) {
    resultsInfo.textContent = "No matches found.";
    return;
  }

  resultsInfo.textContent = `${list.length} item(s) found`;

  list.forEach((item) => {
    resultsContainer.appendChild(createResultCard(item));
  });
}

// ---------------------------
// Search filter
// ---------------------------
function filterItems(query) {
  const q = query.toLowerCase().trim();

  if (q === "") {
    renderResults(lostItems);
    return;
  }

  const filtered = lostItems.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  renderResults(filtered);
}

// ---------------------------
// Input listener
// ---------------------------
searchInput.addEventListener("input", (e) => {
  filterItems(e.target.value);
});

// ---------------------------
// First load → show all posts
// ---------------------------
renderResults(lostItems);

// ---------------------------
// Modal close functionality
// ---------------------------
modalClose.addEventListener("click", () => {
  postModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === postModal) {
    postModal.style.display = "none";
  }
});

// ---------------------------
// Logout button
// ---------------------------
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
