function initMap() {
  // BCIT Library location (SE14 Building)
  const bcitLibrary = { lat: 49.24948329688611, lng: -123.00087181847898 };

  const map = new google.maps.Map(document.getElementById("map"), {
    center: bcitLibrary,
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
  });

  const marker = new google.maps.Marker({
    position: bcitLibrary,
    map: map,
    title: "BCIT Library (SE14 Building)",
  });

  const infoWindow = new google.maps.InfoWindow({
    content:
      "<b>BCIT Library</b><br>SE14 Building, Burnaby Campus<br>Lost & Found available at Service Desk",
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  // Directions button → open Google Maps in a new tab
  document.getElementById("directions-btn").addEventListener("click", () => {
    const confirmDirections = confirm(
      "Would you like to open Google Maps directions to BCIT Library?"
    );
    if (confirmDirections) {
      const { lat, lng } = bcitLibrary;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  });
}
