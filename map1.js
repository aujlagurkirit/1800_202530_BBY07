function initMap() {
  // BCIT Safety & Security (SW01 Building)
  const safetyOffice = { lat: 49.25127479449927, lng: -123.0024951386435 };

  const map = new google.maps.Map(document.getElementById("map"), {
    center: safetyOffice,
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
  });

  const marker = new google.maps.Marker({
    position: safetyOffice,
    map: map,
    title: "BCIT Safety & Security (SW01)",
  });

  const infoWindow = new google.maps.InfoWindow({
    content:
      "<b>BCIT Safety & Security</b><br>SW01 Building, Room 1060<br>Open 24/7",
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  // Button → open Google Maps directions
  document.getElementById("directions-btn").addEventListener("click", () => {
    const confirmDirections = confirm(
      "Open Google Maps directions to BCIT Safety & Security?"
    );
    if (confirmDirections) {
      const { lat, lng } = safetyOffice;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  });
}
