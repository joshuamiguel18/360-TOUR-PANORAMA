import { panoramas } from './data.js';

let viewer;
let panoramaImage;

const imageContainer = document.querySelector(".image-container");




// Initialize the viewer
function initializeViewer() {
  viewer = new PANOLENS.Viewer({
    container: imageContainer,
    autoRotate: true,
    autoRotateSpeed: 0.6,
    controlBar: false,
    viewIndicator: true,
    reverseDragging: false,
    cameraFov: 90,
  });
  
  loadPanorama(0); // Load the first panorama by defaults
}

function showPreloader() {
  const preloader = document.getElementById('preloader');
  preloader.style.visibility = 'visible';
  preloader.style.opacity = '1';
}

function hidePreloader() {
  const preloader = document.getElementById('preloader');
  preloader.style.opacity = '0';
  setTimeout(() => {
    preloader.style.visibility = 'hidden';
  }, 300); // Timeout to match the fade-out transition
}


// Load panorama with hotspots that can switch between panoramas
function loadPanorama(index) {
  const panoramaData = panoramas[index];

  // Show preloader
  showPreloader();

  // Fade out the current panorama
  imageContainer.classList.add('hidden');

  setTimeout(() => {
    // Remove the existing panorama if it exists
    if (panoramaImage) {
      panoramaImage.dispose();
      viewer.remove(panoramaImage);
      
    }

    // Create and add the new panorama
    panoramaImage = new PANOLENS.ImagePanorama(panoramaData.imagePath);
    
    viewer.add(panoramaImage);


    // After adding the new panorama, fade it in
    imageContainer.classList.remove('hidden');



    // Add hotspots for the panorama
    panoramaData.hotspots.forEach((hotspotData) => {
      var hotspot;

      if (!hotspotData.hotspotOnly) {
        hotspot = new PANOLENS.Infospot(hotspotData.size, PANOLENS.DataImage.Arrow);
        hotspot.position.set(hotspotData.position.x, hotspotData.position.y, hotspotData.position.z);
        hotspot.addEventListener('click', () => {
          // Show preloader before switching to another panorama
          showPreloader();
          loadPanorama(hotspotData.index);
        });
      } else {
        hotspot = new PANOLENS.Infospot(hotspotData.size, PANOLENS.DataImage.Info);
        hotspot.position.set(hotspotData.position.x, hotspotData.position.y, hotspotData.position.z);
        hotspot.addEventListener('click', () => {
          // Show the modal when a hotspot is clicked
          modal.style.visibility = 'visible';
          modal.style.opacity = '1';

          // Dynamically load content into modal
          document.getElementById('title').innerText = hotspotData.title;
          document.getElementById('description').innerText = hotspotData.description;
          document.getElementById('imageSource').src = hotspotData.sourceImage;

          // Close modal logic
          document.getElementById('close-btn').onclick = (e) => {
            e.preventDefault();
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
          };
        });
      }

      // Add the hotspot to the panorama
      panoramaImage.add(hotspot);
      setTimeout(() => {hidePreloader()}, 200);
      
    });
  }, 500); // 500ms delay for the fade effect
      // Hide preloader
  
}










// Initialize the viewer and load the first panorama
initializeViewer();

window.loadPanorama = loadPanorama;

window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');
  preloader.style.opacity = '0';
  preloader.style.visibility = 'hidden';
});
