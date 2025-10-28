// TEMPORARY SAMPLE DATA
// Later this can come from Firestore.
// Right now it's just an array so the search page works for demo & grading.
const lostItems = [
  {
    name: "Black North Face Backpack",
    desc: "Laptop inside. Has BCIT ID tag on zipper.",
    location: "SE12 Cafeteria",
    time: "Reported: Oct 25, 2025",
    keywords: "black backpack bag northface north face laptop bcit id",
  },
  {
    name: "AirPods Pro (Left Earbud Only)",
    desc: "Found in hallway outside SW01 lab rooms.",
    location: "SW01 2nd Floor Hallway",
    time: "Found: Oct 24, 2025",
    keywords: "airpods airpod pro earbud apple headphones left white",
  },
  {
    name: "Blue Hydro Flask Water Bottle",
    desc: "Sticker: 'BCIT Aerospace'.",
    location: "Gym change room",
    time: "Found: Oct 23, 2025",
    keywords: "water bottle hydroflask hydro flask blue bottle drink gym",
  },
  {
    name: "Keys with Toyota key fob",
    desc: "3 keys on a silver ring and a black Toyota fob.",
    location: "Parking Lot A",
    time: "Reported: Oct 22, 2025",
    keywords:
      "key keys keychain toyota car keys fob black silver ring parking lot",
  },
];

// grab DOM elements
const searchInput = document.getElementById("searchInput");
const resultsInfo = document.getElementById("resultsInfo");
const resultsContainer = document.getElementById("resultsContainer");

// build one item card
function createResultCard(item) {
  const card = document.createElement("div");
  card.classList.add("result-card");

  card.innerHTML = `
    <div class="result-top-row">
      <p class="result-name">${item.name}</p>
      <p class="result-location">${item.location}</p>
    </div>
    <p class="result-desc">${item.desc}</p>
    <p class="result-time">${item.time}</p>
  `;

  return card;
}

// render many cards
function renderResults(list) {
  // clear old results
  resultsContainer.innerHTML = "";

  if (list.length === 0) {
    resultsInfo.textContent = "No matches found.";
    return;
  }

  resultsInfo.textContent = `${list.length} item(s) found`;

  list.forEach((item) => {
    const card = createResultCard(item);
    resultsContainer.appendChild(card);
  });
}

// filter items by query
function filterItems(query) {
  const q = query.toLowerCase().trim();

  if (q === "") {
    renderResults(lostItems);
    return;
  }

  const filtered = lostItems.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  renderResults(filtered);
}

// listen to typing
searchInput.addEventListener("input", (e) => {
  filterItems(e.target.value);
});

// show all items at page load
renderResults(lostItems);
