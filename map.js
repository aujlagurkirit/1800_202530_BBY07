// map.js
// Modern Google Maps loader (no callback)
import { Loader } from "https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.16.2/+esm";

const loader = new Loader({
  apiKey: "AIzaSyBJzVaa2VGL0QBU-5R9hYKZTRBScwGnL5o",
  version: "weekly",
  libraries: ["marker"],
  mapId: "3cac6ee76aa6116810dde040", // ✅ YOUR MAP ID
});

let map;
let markers = {};
let infoWindows = {};

export async function initMap() {
  const google = await loader.load();

  const defaultCenter = { lat: 49.2502, lng: -123.0018 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 16,
    mapId: "3cac6ee76aa6116810dde040", // IMPORTANT
    disableDefaultUI: false,
  });

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

  // Create markers
  for (const key in locations) {
    const loc = locations[key];

    const popup = new google.maps.InfoWindow({
      content: `<b>${loc.name}</b><br>${loc.details}`,
    });
    infoWindows[key] = popup;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: loc.position,
      title: loc.name,
    });

    markers[key] = marker;

    marker.addListener("click", () => {
      popup.open({ map, anchor: marker });

      map.panTo(loc.position);
      map.setZoom(18);

      if (confirm(`Open Google Maps directions to ${loc.name}?`)) {
        const { lat, lng } = loc.position;
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
          "_blank"
        );
      }
    });
  }

  // Card click → focus
  document.querySelectorAll(".info-card").forEach((card) => {
    card.addEventListener("click", () => {
      focusLocation(card.dataset.location);
    });
  });
}

export function focusLocation(id) {
  const marker = markers[id];
  const popup = infoWindows[id];

  if (!marker) return;

  const pos = marker.position;

  map.panTo(pos);
  map.setZoom(18);

  popup.open({ map, anchor: marker });
}
