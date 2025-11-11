// =========================
// Firebase setup
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwRxRdw9-IcdQFOIZlMuCSwXggMjNgLDo",
  authDomain: "refood-d02c3.firebaseapp.com",
  databaseURL: "https://refood-d02c3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "refood-d02c3",
  storageBucket: "refood-d02c3.firebasestorage.app",
  messagingSenderId: "229281434547",
  appId: "1:229281434547:web:a6028e8293421aa60959c6",
  measurementId: "G-Q6WXVK4TTN"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================
// Initialize Leaflet map
// =========================
const map = L.map("map").setView([12.9716, 77.5946], 12); // Default: Bengaluru

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);

// =========================
// Sample food spots (optional, initial markers)
// =========================
const foodSpots = [
  { name: "Community Kitchen – Indiranagar", coords: [12.9784, 77.6408], description: "🍛 Hot meals available for donation pickup." },
  { name: "Leftover Food – MG Road", coords: [12.9741, 77.6053], description: "🥗 Fresh leftover food from event." },
  { name: "ReFood Volunteer – Koramangala", coords: [12.9352, 77.6245], description: "🍱 Ready-to-serve meals, please contact." }
];

foodSpots.forEach(spot => {
  L.marker(spot.coords)
    .addTo(map)
    .bindPopup(`<b>${spot.name}</b><br>${spot.description}`);
});

// =========================
// Geolocation: user's location
// =========================
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      map.setView([lat, lng], 14);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("📍 You are here")
        .openPopup();
    },
    () => {
      console.log("Geolocation permission denied.");
    }
  );
}

// =========================
// Load food listings from Firebase
// =========================
const listingsRef = ref(db, "listings/");
onValue(listingsRef, (snapshot) => {
  const data = snapshot.val();

  // Remove only markers added for listings, keep map and user location marker safe
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      const popup = layer.getPopup();
      if (popup && !popup.getContent().includes("You are here")) {
        map.removeLayer(layer);
      }
    }
  });

  if (data) {
    Object.values(data).forEach(item => {
      if (item.lat && item.lng) {
        const marker = L.marker([item.lat, item.lng]).addTo(map);

        const title = item.name || item.title || "Unnamed Listing";
        const desc = item.description || item.Description || item.desc || item.about || "No description provided";
        const qty = item.quantity || item.qty || "Not specified";
        const status = item.status || "available";


        marker.bindPopup(`
          <b>${title}</b><br>
          ${desc}<br>
          🍱 Quantity: ${qty}<br>
          <i>Status: ${status}</i>
        `);
      }
    });
  }
});