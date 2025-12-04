// map.js 
import { Loader } from "https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.16.2/+esm";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const loader = new Loader({
  apiKey: "AIzaSyBJzVaa2VGL0QBU-5R9hYKZTRBScwGnL5o",
  version: "weekly",
  libraries: ["marker"],
  mapId: "3cac6ee76aa6116810dde040",
});

let map;
let postMarkers = [];
let googleObj;

const buildingLocations = {
  sw01: {
    position: { lat: 49.25127479449927, lng: -123.0024951386435 },
    name: "SW01",
  },
  sw02: {
    position: { lat: 49.25009636123301, lng: -123.00274222112724 },
    name: "SW02",
  },
  sw03: {
    position: { lat: 49.25045666822442, lng: -123.00346817734105 },
    name: "SW03",
  },
  sw05: {
    position: { lat: 49.249769724464116, lng: -123.00266594285405 },
    name: "SW05",
  },
  se12: {
    position: { lat: 49.24993686765993, lng: -123.00158409787167 },
    name: "SE12",
  },
  library: {
    position: { lat: 49.24948329688611, lng: -123.00087181847898 },
    name: "Library",
  },
  "tim hortons": {
    position: { lat: 49.250385170857605, lng: -123.00185889695382 },
    name: "Tim Hortons",
  },
  gymnasium: {
    position: { lat: 49.248849177397794, lng: -123.00089677386947 },
    name: "Gymnasium",
  },
};

function relativeTime(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function offsetPosition(center, index, total) {
  if (total === 1) return center;

  const angle = (index / total) * Math.PI * 2;
  const radius = 0.0001;

  return {
    lat: center.lat + radius * Math.cos(angle),
    lng: center.lng + radius * Math.sin(angle),
  };
}

export async function initMap() {
  googleObj = await loader.load();

  // BASE MAP
  map = new googleObj.maps.Map(document.getElementById("map"), {
    center: { lat: 49.2502, lng: -123.0018 },
    zoom: 16,
    mapId: "3cac6ee76aa6116810dde040",
  });

  await loadPostMarkers();
}

// Load markers from Firestore posts
async function loadPostMarkers() {
  const db = getFirestore();
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  // Group posts by location
  const grouped = {};
  snap.forEach((docSnap) => {
    const p = docSnap.data();
    const locKey = (p.location || "").toLowerCase();

    if (!buildingLocations[locKey]) return;

    if (!grouped[locKey]) grouped[locKey] = [];
    grouped[locKey].push(p);
  });

  for (const locKey in grouped) {
    const posts = grouped[locKey];
    const base = buildingLocations[locKey].position;

    posts.forEach((post, i) => {
      const pos = offsetPosition(base, i, posts.length);

      const popupHTML = `
        <div style="font-size:14px;">
          <b>${post.title}</b><br>
          ${post.location} — ${relativeTime(post.createdAt)}<br><br>
          ${post.description}<br><br>

          <a href="search.html" 
             style="
                background:#1e3a8a; 
                padding:6px 10px; 
                color:white; 
                border-radius:6px; 
                text-decoration:none;"
          >
            More Info
          </a>
        </div>
      `;

      const infoWindow = new googleObj.maps.InfoWindow({
        content: popupHTML,
      });

      const marker = new googleObj.maps.marker.AdvancedMarkerElement({
        map,
        position: pos,
        title: post.title,
      });

      postMarkers.push(marker);

      marker.addListener("click", () => {
        infoWindow.open({ map, anchor: marker });

        if (confirm(`Open Google Maps directions to ${post.location}?`)) {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${base.lat},${base.lng}`,
            "_blank"
          );
        }
      });
    });
  }
}
