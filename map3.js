function initMap() {
  // BCIT Gymnasium (SE16 Building)
  const bcitGym = { lat: 49.248849177397794, lng: -123.00089677386947 };

  const map = new google.maps.Map(document.getElementById("map"), {
    center: bcitGym,
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
  });

  const marker = new google.maps.Marker({
    position: bcitGym,
    map: map,
    title: "BCIT Gymnasium (SE16 Building)",
  });

  const infoWindow = new google.maps.InfoWindow({
    content:
      "<b>BCIT Gymnasium</b><br>SE16 Building, Burnaby Campus<br>Lost & Found managed by Recreation staff",
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  // Directions button
  document.getElementById("directions-btn").addEventListener("click", () => {
    const confirmDirections = confirm(
      "Would you like to open Google Maps directions to BCIT Gymnasium?"
    );
    if (confirmDirections) {
      const { lat, lng } = bcitGym;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  });
}
