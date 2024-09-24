import { panoramas } from './data.js';

let viewer;
let panoramaImage;

const imageContainer = document.querySelector(".image-container");

imageContainer.addEventListener('mousemove', (event) => {
  // Get the mouse position relative to the canvas
  const rect = imageContainer.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1; // Normalize to -1 to 1
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1; // Normalize to -1 to 1

  // Create a new vector for the normalized mouse position
  const vector = new THREE.Vector3(mouseX, mouseY, 0.5); // z set to 0.5 for depth
  vector.unproject(viewer.camera); // Convert from normalized device coordinates to 3D world coordinates

  // Log the world coordinates (x, y, z)
  console.log(`X: ${vector.x}, Y: ${vector.y}, Z: ${vector.z}`);
});



// Initialize the viewer
function initializeViewer() {
  viewer = new PANOLENS.Viewer({
    container: imageContainer,
    autoRotate: true,
    autoRotateSpeed: 0.3,
    controlBar: false,
    viewIndicator: true,
    reverseDragging: false,
    cameraFov: 90,
  });

  loadPanorama(0); // Load the first panorama by defaults
}




// Load panorama with hotspots that can switch between panoramas
function loadPanorama(index) {
  const panoramaData = panoramas[index];

  // Remove the existing panorama if it exists
  if (panoramaImage) {
    viewer.remove(panoramaImage);
    panoramaImage.dispose();
  }

  // Create and add the new panorama
  panoramaImage = new PANOLENS.ImagePanorama(panoramaData.imagePath);
  viewer.add(panoramaImage);



  // Add hotspots for the panorama
  panoramaData.hotspots.forEach((hotspotData) => {
    var hotspot;
   
  
    if (!hotspotData.hotspotOnly) {
      hotspot = new PANOLENS.Infospot(hotspotData.size, PANOLENS.DataImage.Arrow);
      hotspot.position.set(hotspotData.position.x, hotspotData.position.y, hotspotData.position.z);
      hotspot.addEventListener('click', () => {
        // Trigger the function defined in the hotspot data to switch panoramas
        loadPanorama(hotspotData.index); // or use hotspotData.onClick if it defines the panorama index
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
  
        // Close modal logic (make sure this is outside of the loop)
        document.getElementById('close-btn').onclick = (e) => {
          e.preventDefault();
          modal.style.visibility = 'hidden';
          modal.style.opacity = '0';
        };
      });
    }
  
    // Add the hotspot to the panorama
    panoramaImage.add(hotspot);
  });
  
}









// Initialize the viewer and load the first panorama
initializeViewer();

window.loadPanorama = loadPanorama;

window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');
  preloader.style.opacity = '0';
  preloader.style.visibility = 'hidden';
});
