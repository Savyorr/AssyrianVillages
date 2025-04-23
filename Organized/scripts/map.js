mapboxgl.accessToken = 'pk.eyJ1Ijoic2F2eW9yaiIsImEiOiJjbTJpNjFoOTEwaXFxMmxvczJtYTN4em9zIn0.hFMShjYi8Wra3-52ycadLw';

// Detect if the user is on mobile
const isMobile = window.innerWidth <= 768; // You can adjust this threshold if needed

// Set different map options based on device
const mapCenter = isMobile ? [41.79, 37.2] : [42.2, 37.5]; // Adjust these as needed
const mapZoom = isMobile ? 5.15 : 6.4; // Adjust zoom for mobile

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/savyorj/cm2i1x0d100qv01ps4ofm2r16',
  center: mapCenter,
  zoom: mapZoom
});


// === DOM elements ===
const popupContainer = document.getElementById('popup-container');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');
const popupImage = document.getElementById('popup-image');
const closePopup = document.getElementById('close-popup');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchButton = document.getElementById('search-button');

closePopup.addEventListener('click', () => {
  popupContainer.classList.remove('show');
});

let allVillages = [];
let villageMarkers = [];
let regionMarkers = [];

// === Load Villages ===
fetch('data/villages.json')
  .then(res => res.json())
  .then(villages => {
    allVillages = villages;

    villages.forEach(village => {
      const el = document.createElement('div');
      el.className = 'custom-marker village-marker';

      const label = document.createElement('div');
      label.className = 'custom-marker-label';
      label.textContent = village.name;
      el.appendChild(label);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([village.lng, village.lat]);

      marker._village = village;
      marker._element = el;
      marker._added = false;

      el.addEventListener('click', () => showVillagePopup(village));

      villageMarkers.push(marker);
    });

    updateMarkers(); // show markers after loading
  });

// === Load Regions ===
fetch('data/regions.json')
  .then(res => res.json())
  .then(regions => {
    regions.forEach(region => {
      const el = document.createElement('div');
      el.className = 'region-marker';

      const label = document.createElement('div');
      label.className = 'region-marker-label';
      label.textContent = region.name;

      // 👇 Add this to check for bottom label positioning
      if (region.labelPosition === 'bottom') {
        label.classList.add('label-bottom');
      }
      if (region.name === "TUR ABDIN") {
        label.classList.add('label-shift-left');
      }
      
      if (region.name === "BOTAN") {
        label.classList.add('label-shift-right');
      }
      if (region.name === "MALATYA") {
        label.classList.add('label-shift-malatya');
      }
      if (region.name === "AQRA") {
        label.classList.add('label-shift-aqra');
      }
            
      el.appendChild(label);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([region.lng, region.lat])
        .addTo(map);

      regionMarkers.push(marker);

      el.addEventListener('click', () => {
        map.flyTo({ center: [region.lng, region.lat], zoom: 9 });
      });
    });
  });


// === Marker Toggle Logic ===
function updateMarkers() {
  if (!map || !map.getBounds) return;

  const zoom = map.getZoom();
  const bounds = map.getBounds();

  // --- Villages ---
  villageMarkers.forEach(marker => {
    const pos = marker.getLngLat();
    const shouldShow = zoom >= 8 && bounds.contains(pos);

    if (shouldShow && !marker._added) {
      marker.addTo(map);
      marker._added = true;
    } else if (!shouldShow && marker._added) {
      marker.remove();
      marker._added = false;
    }
  });

  // --- Regions ---
  regionMarkers.forEach(marker => {
    marker.getElement().style.display = zoom < 8 ? 'block' : 'none';
  });
}

map.on('load', () => {
  updateMarkers();
  map.on('zoomend', updateMarkers);
  map.on('moveend', updateMarkers);
});

// === Popup ===
function showVillagePopup(village) {
  popupTitle.textContent = village.name;
  popupDescription.textContent = village.description || 'No description available.';
  if (village.image) {
    popupImage.src = village.image;
    popupImage.style.display = 'block';
  } else {
    popupImage.style.display = 'none';
  }
  popupContainer.classList.add('show');
}

// === Search ===
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  searchResults.innerHTML = '';
  if (!query) return;

  const matches = allVillages.filter(v => v.name.toLowerCase().includes(query)).slice(0, 5);

  matches.forEach(village => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="search-result-item">
        <img src="${village.image || 'assets/icons/houses.png'}" alt="${village.name}" class="search-thumb" onerror="this.src='assets/icons/houses.png';" />
        <span class="search-name">${village.name}</span>
      </div>
    `;
    li.addEventListener('click', () => {
      map.flyTo({ center: [village.lng, village.lat], zoom: 14 });
      searchInput.value = '';
      searchResults.innerHTML = '';
    });
    searchResults.appendChild(li);
  });
});

searchButton.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase();
  if (!query) return;

  const match = allVillages.find(v => v.name.toLowerCase().includes(query));
  if (match) {
    map.flyTo({ center: [match.lng, match.lat], zoom: 14 });
    searchInput.value = '';
    searchResults.innerHTML = '';
  } else {
    alert('No village found matching your search.');
  }
});

// === Intro Transition ===
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById('intro-section');
  const enterBtn = document.getElementById('enter-button');
  const searchContainer = document.getElementById('search-container');

  if (searchContainer) searchContainer.style.display = 'none';
  if (searchButton) searchButton.style.display = 'none';

  enterBtn.addEventListener('click', () => {
    intro.style.opacity = '0';
    intro.style.pointerEvents = 'none';

    setTimeout(() => {
      if (searchContainer) searchContainer.style.display = 'flex';
      if (searchButton) searchButton.style.display = 'inline-block';
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  });
});

// === Contact / About Popups ===
function openContactPopup() {
  document.getElementById('popup-overlay').style.display = 'block';
  document.getElementById('contact-popup').style.display = 'block';
}
function closeContactPopup() {
  document.getElementById('popup-overlay').style.display = 'none';
  document.getElementById('contact-popup').style.display = 'none';
}
function openAboutPopup() {
  document.getElementById('About-popup').style.display = 'block';
  document.getElementById('popup-overlay').style.display = 'block';
}
function closeAboutPopup() {
  document.getElementById('About-popup').style.display = 'none';
  document.getElementById('popup-overlay').style.display = 'none';
}
// Example: open the popup
function openPopup() {
  document.getElementById('popup').style.display = 'block';
  document.getElementById('popup-overlay').style.display = 'block';
}

// Close popup
document.getElementById('close-popup').addEventListener('click', function() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('popup-overlay').style.display = 'none';
});



// === 📱 MOBILE SEARCH FUNCTIONALITY ===
const mobileSearchInput = document.getElementById('mobile-search-bar');
const mobileSearchResults = document.getElementById('mobile-search-results');

if (mobileSearchInput && mobileSearchResults) {
  mobileSearchInput.addEventListener('input', () => {
    const query = mobileSearchInput.value.trim().toLowerCase();
    mobileSearchResults.innerHTML = '';
    mobileSearchResults.classList.remove('active'); // Hide it by default

    if (!query || !allVillages.length) return;

    const matches = allVillages.filter(v =>
      v.name && v.name.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length === 0) return;

    mobileSearchResults.classList.add('active'); // Show only if matches found

    matches.forEach(village => {
      const li = document.createElement('li');
      li.className = 'search-result-item';
      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${village.image ? village.image : 'assets/icons/houses.png'}" alt="${village.name}" style="width: 30px; height: 30px;" onerror="this.src='assets/icons/houses.png';" />

          <span>${village.name}</span>
        </div>
      `;
      li.addEventListener('click', () => {
        map.flyTo({ center: [village.lng, village.lat], zoom: 14 });
        mobileSearchInput.value = '';
        mobileSearchResults.innerHTML = '';
        mobileSearchResults.classList.remove('active');
      });
      mobileSearchResults.appendChild(li);
    });
  });
}

document.addEventListener('click', (e) => {
  // If the click is outside the mobile search bar and results box
  if (
    !mobileSearchInput.contains(e.target) &&
    !mobileSearchResults.contains(e.target)
  ) {
    mobileSearchResults.classList.remove('active');
    mobileSearchResults.innerHTML = '';
  }
});







