let map;
let markers = [];
let drawerOpen = false;

// Initialize the map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 11.685, lng: 76.131 }, // Default center: Wayanad
    zoom: 9,
    mapTypeId: "roadmap",
    styles: [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#101010" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#dadada" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#a2daf2" }] },
      { featureType: "landscape.natural", stylers: [{ color: "#eeeeee" }] },
      { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
      { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] }
    ]
  });

  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1hPV5GeqIX_-8QLT1yEdXY0t4mf3UebtfXfAfW0mAuIW7lCN2TvWbaZxZF9qa8IDndMcOqyWwJDwi/pub?output=csv";

  fetch(sheetUrl)
    .then(res => res.text())
    .then(csvText => {
      const parsed = Papa.parse(csvText, { header: true });
      parsed.data.forEach(loc => {
        const lat = parseFloat(loc.Latitude);
        const lng = parseFloat(loc.Longitude);
        if (!lat || !lng) return;

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: loc.Name
        });

        const contentString = `
          <div style="max-width: 250px;">
            <img src="${loc["Image URL"] || 'https://via.placeholder.com/200x100'}" alt="${loc.Name}" style="width:100%; border-radius: 8px; margin-bottom: 5px;">
            <strong>${loc.Name}</strong><br>
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="color:#e60050; text-decoration:underline;">View on Google Maps</a>
          </div>
        `;

        const infowindow = new google.maps.InfoWindow({ content: contentString });
        marker.addListener("click", () => infowindow.open(map, marker));
        markers.push(marker);
      });
    })
    .catch(err => console.error("Error loading Google Sheet:", err));
}

// Search a location on map
function searchLocation() {
  const input = document.getElementById("locationInput").value;
  const geocoder = new google.maps.Geocoder();
  if (!input) return;

  geocoder.geocode({ address: input }, (results, status) => {
    if (status === "OK") {
      map.setCenter(results[0].geometry.location);
      map.setZoom(12);
    } else {
      alert("Location not found: " + status);
    }
  });
}

// Toggle drawer open/close
function toggleDrawer() {
  const drawer = document.getElementById("destinationDrawer");
  const toggle = document.getElementById("toggleDrawer");
  drawer.classList.toggle("open");
  drawerOpen = !drawerOpen;
  toggle.querySelector(".chevron").textContent = drawerOpen ? "▼" : "▲";
  toggle.querySelector("span").textContent = drawerOpen ? "Hide destination list" : "View a list of destinations";
}

// Show/hide taluks
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      const d = row.getAttribute('data-district');
      const talukRow = document.querySelector(`tr.taluk-row.${d}`);
      const open = talukRow.style.display === 'table-row';
      talukRow.style.display = open ? 'none' : 'table-row';
      row.cells[0].textContent = row.cells[0].textContent.replace(open ? '▲' : '▼', open ? '▼' : '▲');
    });
  });
});

//desktop search

  const suggestions = [
    // Kerala Districts
    { city: "Thiruvananthapuram", country: "Kerala", cityUrl: "thiruvananthapuram.html", countryUrl: "kerala.html" },
    { city: "Kollam", country: "Kerala", cityUrl: "kollam.html", countryUrl: "kerala.html" },
    { city: "Pathanamthitta", country: "Kerala", cityUrl: "pathanamthitta.html", countryUrl: "kerala.html" },
    { city: "Alappuzha", country: "Kerala", cityUrl: "alappuzha.html", countryUrl: "kerala.html" },
    { city: "Kottayam", country: "Kerala", cityUrl: "kottayam.html", countryUrl: "kerala.html" },
    { city: "Idukki", country: "Kerala", cityUrl: "idukki.html", countryUrl: "kerala.html" },
    { city: "Thrissur", country: "Kerala", cityUrl: "thrissur.html", countryUrl: "kerala.html" },
    { city: "Palakkad", country: "Kerala", cityUrl: "palakkad.html", countryUrl: "kerala.html" },
    { city: "Malappuram", country: "Kerala", cityUrl: "malappuram.html", countryUrl: "kerala.html" },
    { city: "Kozhikode", country: "Kerala", cityUrl: "kozhikode.html", countryUrl: "kerala.html" },
    { city: "Kannur", country: "Kerala", cityUrl: "kannur.html", countryUrl: "kerala.html" },
    { city: "Kasaragod", country: "Kerala", cityUrl: "kasaragod.html", countryUrl: "kerala.html" },
    

    // Wayanad Taluks
    { city: "Mananthavady", country: "Wayanad", cityUrl: "mananthavady.html", countryUrl: "wayanad.html" },
    { city: "Vythiri", country: "Wayanad", cityUrl: "vythiri.html", countryUrl: "wayanad.html" },
    { city: "Sulthan Bathery", country: "Wayanad", cityUrl: "sulthan-bathery.html", countryUrl: "wayanad.html" },

    // State itself
    { city: "Kerala", country: "India", cityUrl: "kerala.html", countryUrl: "india.html" },
  ];

  function showSuggestions() {
    const input = document.getElementById("searchInput");
    const box = document.getElementById("suggestionsBox");
    const query = input.value.toLowerCase().trim();

    box.innerHTML = "";
    if (query === "") {
      box.classList.add("hidden");
      return;
    }

    const filtered = suggestions.filter(item =>
      item.city.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      box.classList.add("hidden");
      return;
    }

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer border-b";
      div.innerHTML = `
        <span onclick="window.location='${item.cityUrl}'" class="text-gray-900 font-semibold">${item.city}</span>
        <span onclick="window.location='${item.countryUrl}'" class="text-gray-500 text-sm">${item.country}</span>
      `;
      box.appendChild(div);
    });

    box.classList.remove("hidden");
  }

  // Hide suggestions on outside click
  document.addEventListener("click", function (event) {
    const input = document.getElementById("searchInput");
    const box = document.getElementById("suggestionsBox");
    if (!input.contains(event.target) && !box.contains(event.target)) {
      box.classList.add("hidden");
    }
  });

  //mobile search

const suggestionss = [
  { city: "Mananthavady", country: "India", cityUrl: "mananthavady.html", countryUrl: "india.html" },
  { city: "Vythiri", country: "India", cityUrl: "vythiri.html", countryUrl: "india.html" },
  { city: "Sulthan Bathery", country: "India", cityUrl: "sulthan-bathery.html", countryUrl: "india.html" },
  { city: "Thiruvananthapuram", country: "India", cityUrl: "#", countryUrl: "#" },
  { city: "Kollam", country: "India", cityUrl: "#", countryUrl: "#" },
  { city: "Kozhikode", country: "India", cityUrl: "#", countryUrl: "#" }
  // Add more as needed...
];

// Toggle search box when icon is clicked
document.getElementById("mobileSearchIcon").addEventListener("click", function () {
  const box = document.getElementById("mobileSearchContainer");
  box.classList.toggle("hidden");
});

// Show suggestions (mobile)
function showMobileSuggestions() {
  const input = document.getElementById("mobileSearchInput");
  const box = document.getElementById("mobileSuggestionsBox");
  const query = input.value.toLowerCase().trim();
  box.innerHTML = "";

  if (query === "") {
    box.classList.add("hidden");
    return;
  }

  const filtered = suggestions.filter(item =>
    item.city.toLowerCase().includes(query) || item.country.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    box.classList.add("hidden");
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer border-b";
    div.innerHTML = `
      <span onclick="window.location='${item.cityUrl}'" class="text-gray-900 font-semibold">${item.city}</span>
      <span onclick="window.location='${item.countryUrl}'" class="text-gray-500 text-sm">${item.country}</span>
    `;
    box.appendChild(div);
  });

  box.classList.remove("hidden");
}

//next

  const translations = {
    en: {
      destinationsTitle: "HavaRoute Destinations",
      subheading: "+100 destinations +300 activities",
      hideList: "Hide destination list",
      searchPlaceholder: "Where are you traveling to?"
    },
    ml: {
      destinationsTitle: "ഹവാരൂട്ടിന്റെ ഗമ്യസ്ഥാനങ്ങൾ",
      subheading: "+100 ഗമ്യസ്ഥാനങ്ങൾ +300 പ്രവർത്തനങ്ങൾ",
      hideList: "ഗമ്യസ്ഥാനം പട്ടിക മറയ്ക്കുക",
      searchPlaceholder: "താങ്കൾ എവിടേക്ക് യാത്രചെയ്യുന്നു?"
    },
    hi: {
      destinationsTitle: "हवाइरूट गंतव्य",
      subheading: "+100 गंतव्य +300 गतिविधियाँ",
      hideList: "गंतव्य सूची छिपाएँ",
      searchPlaceholder: "आप कहाँ यात्रा कर रहे हैं?"
    }
  };

  function toggleLangDropdown() {
    document.getElementById("langDropdown").classList.toggle("hidden");
  }

  function setLanguage(lang) {
    // Translate elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.innerText = translations[lang][key];
      }
    });

    // Toggle visibility of elements by lang-* class (optional)
    document.querySelectorAll('[class^="lang-"]').forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".lang-" + lang).forEach(el => el.classList.remove("hidden"));

    // Update placeholders for both search inputs
    const placeholderText = translations[lang].searchPlaceholder || translations.en.searchPlaceholder;
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("mobileSearchInput");
    if (desktopInput) desktopInput.placeholder = placeholderText;
    if (mobileInput) mobileInput.placeholder = placeholderText;

    // Update language dropdown label
    const currentLangEl = document.getElementById("currentLang");
    if (currentLangEl) currentLangEl.innerText = lang.toUpperCase();

    // Hide dropdown and save preference
    const dropdown = document.getElementById("langDropdown");
    if (dropdown) dropdown.classList.add("hidden");

    localStorage.setItem("preferredLanguage", lang);
  }

  // Auto-load preferred language on page load
  window.addEventListener("DOMContentLoaded", () => {
    const preferredLang = localStorage.getItem("preferredLanguage") || "en";
    setLanguage(preferredLang);
  });

