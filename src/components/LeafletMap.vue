<template>
  <div>
    <div id="map" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
export default {
  name: 'LeafletMap',
  data() {
    return {
      map: null,
      routingControl: null,
      popup: null,
      currentLocation: null
    };
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = L.map('map').setView([-1.286389, 36.817223], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.initializeGeocoder();
      this.map.on('click', this.onMapClick);

      // Get current location and use it as the starting point
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(this.onCurrentLocationReceived);
      }
    },
    initializeGeocoder() {
      L.Control.geocoder({
        defaultMarkGeocode: false,
        collapsed: false,
        placeholder: 'Search for a location...',
        showResultIcons: true
      }).addTo(this.map);
      this.map.on('geocoder:result', this.onGeocodeResult);
    },
   onMapClick(event) {
  if (!this.routingControl && this.currentLocation) {
    const waypoints = [
      L.latLng(this.currentLocation.lat, this.currentLocation.lng),
      event.latlng
    ];

    const carIcon = L.icon({
      iconUrl: "images/car-icon.png",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    this.routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      show: false,
      lineOptions: {
        styles: [{ color: 'blue', opacity: 1, weight: 5 }]
      },
      createMarker: (i, waypoint, n) => {
        const isStart = i === 0;
        const icon = isStart ? carIcon : L.divIcon({ className: 'end-marker' });

        return L.marker(waypoint.latLng, { icon });
      },
      router: new L.Routing.osrmv1({
        language: 'en'
      })
    }).addTo(this.map);

    this.routingControl.on('routesfound', this.onRoutesFound);
  } else {
    this.map.removeControl(this.routingControl);
    this.routingControl = null;
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
  }
},

   onRoutesFound(e) {
  const unwantedContainer = document.querySelector('.leaflet-routing-container');
  if (unwantedContainer) {
    unwantedContainer.remove();
  }

  const route = e.routes[0];
  const distance = route.summary.totalDistance / 1000;
  const travelTime = route.summary.totalTime / 60;

  const instructions = route.instructions.map(instruction => instruction.text).join('<br>');

  // Calculate the center of the screen
  const center = this.map.latLngToContainerPoint(this.map.getCenter());

  // Create a popup and display routing details
  this.popup = L.popup({
    closeButton: true,
    maxWidth: 130,
    maxHeight:200,
  })
    .setLatLng(this.map.containerPointToLatLng(center))
    .setContent(`<strong>Distance:</strong> ${distance.toFixed(2)} km<br><strong>Travel Time:</strong> ${travelTime.toFixed(0)} minutes<br><br>${instructions}`)
    .openOn(this.map);
},
    onGeocodeResult(result) {
      const latlng = result.center;
      this.map.setView(latlng, 13);
    },
    onCurrentLocationReceived(position) {
      const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.map.setView(latlng, 13);
    }
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}

.end-marker {
  width: 20px;
  height: 20px;
  background-color: red;
  border-radius: 50%;
}

.leaflet-routing-container {
  display: none !important;
}
</style>
