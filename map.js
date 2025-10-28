// Google Maps initialization
function initMap() {
  // Default to Vancouver (if geolocation fails)
  const defaultLocation = { lat: 49.25024147114745, lng: -123.00232350701391 };

  // Create the map
  const map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 13,
  });

  const marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    title: "Default Location (Vancouver)",
  });

  // Attempt to locate user
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        map.setCenter(userLocation);
        marker.setPosition(userLocation);
        marker.setTitle("You are here!");
      },
      (error) => {
        console.warn("Geolocation failed:", error);
        alert("Could not access location — showing Vancouver instead.");
      }
    );
  } else {
    alert("Your browser doesn't support geolocation.");
  }
}
