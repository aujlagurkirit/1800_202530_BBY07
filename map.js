// Google Maps initialization
let map;
let markers = {};
let infoWindow;

function initMap() {
  // Default center (BCIT Burnaby Campus)
  const defaultCenter = { lat: 49.2502, lng: -123.0018 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 16,
    mapTypeControl: false,
    streetViewControl: false,
  });

  infoWindow = new google.maps.InfoWindow();

  // Define BCIT lost & found locations
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

  // Create markers for all locations
  for (const key in locations) {
    const loc = locations[key];
    const marker = new google.maps.Marker({
      position: loc.position,
      map: map,
      title: loc.name,
    });

    // Marker click → info window + prompt for Google Maps directions
    marker.addListener("click", () => {
      infoWindow.setContent(`<b>${loc.name}</b><br>${loc.details}`);
      infoWindow.open(map, marker);
      map.panTo(loc.position);

      // Prompt user for navigation
      const confirmDirections = confirm(
        `Would you like to open Google Maps directions to ${loc.name}?`
      );
      if (confirmDirections) {
        const { lat, lng } = loc.position;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, "_blank");
      }
    });

    markers[key] = marker;
  }

  // Info card click → zoom and pan only (no prompt)
  document.querySelectorAll(".info-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.location;
      focusLocation(id);
    });
  });
}

// Centers and zooms into a location (for info card clicks only)
function focusLocation(id) {
  const marker = markers[id];
  if (marker) {
    const position = marker.getPosition();
    map.panTo(position);
    map.setZoom(18);

    // Just open info window, NO Google Maps prompt
    infoWindow.setContent(`<b>${marker.title}</b>`);
    infoWindow.open(map, marker);
  }
}
