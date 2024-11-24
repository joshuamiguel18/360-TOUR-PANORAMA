import { panoramas, customImages } from './data.js';

let viewer;
let panoramaImage;
var tabs = document.getElementById('tabs');

const imageContainer = document.querySelector(".image-container");

const maxFov = 90; // Maximum zoom-out
const minFov = 20;  // Minimum zoom-in
const fullscreenBtn = document.getElementById('fullscreenBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const toggleInfospotsBtn = document.getElementById('toggleInfospotsBtn');

const panoramaList = [];


function loadButtons() {
  tabs.innerHTML = '';
  panoramas.forEach((panorama, key)=> {

      tabs.innerHTML += `<button class="tab" onclick="loadPanorama(${key})">
            <img src="${panorama.imagePath}" alt="image" />
            <span class="tooltip">Place 2</span>
          </button>`;
  });
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
          window.innerWidth <= 768; // Also check screen width for small devices
}

// Set FOV based on the device type
function returnCameraFOV() {
    const fov = isMobileDevice() ? 90 : 60;
    return fov;
}


// Initialize the viewer
function initializeViewer(fovValue) {
  viewer = new PANOLENS.Viewer({
    container: imageContainer,
    autoRotate: true,
    autoRotateSpeed: 0.6,
    controlBar: false,
    cameraFov: fovValue,
    momentum: false,
    rotateSpeed: -5.0,
    dampingFactor: .01,
    autoHideInfospot: false,
  });
  
  loadButtons();
  loadPanorama(0); // Load the first panorama by defaults

  function smoothZoom(targetFov, duration = 0.4) {  // Adjusted for momentum effect
    // Clamp the target FOV within limits
    targetFov = Math.max(minFov, Math.min(maxFov, targetFov));
    
    // Animate the zoom transition with GSAP
    gsap.to(viewer.camera, {
        fov: targetFov,
        duration: duration,  // Momentum-like transition duration
        onUpdate: () => {
            viewer.camera.updateProjectionMatrix(); // Update camera matrix
            updateInfospotSize();
            viewer.OrbitControls.rotateLeft(velocity.x);
            viewer.OrbitControls.rotateUp(velocity.y);
            viewer.OrbitControls.update(); // Update the controls
        },
        ease: "elastic.out(.5, .7)",// Elastic easing for momentum effect
        overwrite: true
    });
  }
  
  // Add mouse wheel listener for smooth zooming with momentum
  viewer.container.addEventListener('wheel', (event) => {
      event.preventDefault();
      const zoomSpeed = 2; // Increased zoom sensitivity for more responsive zoom
      const newFov = viewer.camera.fov + event.deltaY * 0.05 * zoomSpeed;
      smoothZoom(newFov); // Apply the smooth zoom transition with momentum effect
  });

  // Touch event on phones
  let initialTouchDistance = 0;
  
  viewer.container.addEventListener('touchstart', onTouchStart, { passive: false });
  viewer.container.addEventListener('touchmove', onTouchMove, { passive: false })

  function onTouchStart(event) {
    if (event.touches.length == 2) {
      // Get the initial distance between the two fingers
      initialTouchDistance = getTouchDistance(event);
    }
  }

  function onTouchMove(event) {
    if (event.touches.length == 2) {
      event.preventDefault(); // Prevent the page from scrolling while zooming

      const currentTouchDistance = getTouchDistance(event);
      const distanceDifference = currentTouchDistance - initialTouchDistance;

      // Adjust the zoom based on the distance change
      const zoomSpeed = 0.6; // Zoom sensitivity for touch events
      const newFov = viewer.camera.fov - distanceDifference * zoomSpeed;

      smoothZoom(newFov); // Apply smooth zoom (use your previous smoothZoom function)
      
      // Update the initial distance for the next move event
      initialTouchDistance = currentTouchDistance;
    }
  }

  function getTouchDistance(event) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }


  viewer.OrbitControls.addEventListener('start', () => {
    imageContainer.classList.add('dragging');
    imageContainer.style.cursor = 'grabbing'; // Ensure cursor updates to grabbing
  });

  viewer.OrbitControls.addEventListener('end', () => {
      imageContainer.classList.remove('dragging');
      imageContainer.style.cursor = 'grab'; // Revert to grab when dragging ends
  });
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

function loadPanormas() {
    panoramas.forEach((panoramaItem) => {
      const panoramaItemImage = new PANOLENS.ImagePanorama(panoramaItem.imagePath);
      panoramaList.push(panoramaItemImage);
      viewer.add(panoramaItemImage);
    })
}


// Load panorama with hotspots that can switch between panoramas
function loadPanorama(index) {
  const panoramaData = panoramas[index];

  // Show preloader
  //showPreloader();

  // Fade out the current panorama
  imageContainer.classList.add('hidden');

  setTimeout(() => {
    const panoramaImage = panoramaList[index];
    // Create and add the new panorama
    viewer.setPanorama(panoramaImage);
    const existingHotspots = panoramaImage.children.filter(child => child instanceof PANOLENS.Infospot);
    existingHotspots.forEach(hotspot => panoramaImage.remove(hotspot));


    // After adding the new panorama, fade it in
    imageContainer.classList.remove('hidden');


    
    // Add hotspots for the panorama

    panoramaData.hotspots.forEach((hotspotData) => {
    var hotspot;

    if (!hotspotData.hotspotOnly) {
      hotspot = new PANOLENS.Infospot(hotspotData.size, customImages.arrowUp);
      hotspot.position.set(hotspotData.position.x, hotspotData.position.y, hotspotData.position.z);
      hotspot.addEventListener('click', () => {
        // Show preloader before switching to another panorama
        viewer.tweenControlCenter(hotspot.position, 2000);

        setTimeout(() => {
          loadPanorama(hotspotData.index); // Transition to the next panorama
        }, 500);
        
        
      });
      console.log("Link created")
    } else {
      hotspot = new PANOLENS.Infospot(hotspotData.size, customImages.infoImage);
      hotspot.position.set(hotspotData.position.x, hotspotData.position.y, hotspotData.position.z);
      hotspot.addEventListener('click', () => {
        // Show the modal when a hotspot is clicked\
        viewer.tweenControlCenter(hotspot.position, 1000);
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

    console.log("Hotspot created")
    }

    // Add the hotspot to the panorama
    panoramaImage.add(hotspot);

    setTimeout(() => {hidePreloader()}, 200);
      
  });
  

  }, 500); // 500ms delay for the fade effect
    // Hide preloader
      
  
}


function zoomInAndTransition(targetIndex, targetFov, duration) {
  const initialFov = viewer.getCameraFov();
  const stepCount = 60; // Number of animation steps
  const stepTime = duration / stepCount;
  let currentStep = 0;

  const interval = setInterval(() => {
      currentStep++;
      const newFov = initialFov + ((targetFov - initialFov) * (currentStep / stepCount));
      viewer.setCameraFov(newFov);

      if (currentStep >= stepCount) {
          clearInterval(interval);

          // Transition to the next panorama after zooming in
          loadPanorama(targetIndex);
        }
    }, stepTime);
  }



function updateInfospotSize() {
  // Get the current FOV
  const currentFov = viewer.camera.fov;
  
  // Calculate a scale factor based on the FOV (you can adjust the multiplier for more control)
  const scaleFactor = (currentFov - minFov) / (maxFov - minFov); // Scale based on FOV
  
  // Iterate over all infospots and update their scale
  panoramaImage.children.forEach((child) => {
    if (child instanceof PANOLENS.Infospot) {
      // Adjust size relative to the FOV
      const newSize = child.initialSize * (1 - scaleFactor); // You can adjust this formula for desired effect
      child.scale.set(newSize, newSize, newSize); // Apply new size to both x, y, z axes
    }
  });
}






// Add a button to toggle fullscreen
// Get control elements

// Fullscreen toggle
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
      document.exitFullscreen();
  }
});

const ZOOM_STEP =15; // Smaller step for more control
const ZOOM_DURATION = 300; // Faster zoom duration

// Smooth zoom function using TWEEN.js
function smoothZoom(targetFov, duration = ZOOM_DURATION) {
  const camera = viewer.getCamera();
  const initialFov = camera.fov;

  new TWEEN.Tween({ fov: initialFov })
      .to({ fov: targetFov }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((obj) => {
          camera.fov = obj.fov;
          camera.updateProjectionMatrix();
      })
      .start();
}

// Event listeners for zoom in and out
zoomInBtn.addEventListener('click', () => {
  const camera = viewer.getCamera();
  const newFov = Math.max(minFov, camera.fov - ZOOM_STEP); // Prevent zooming in too much
  smoothZoom(newFov);
});

zoomOutBtn.addEventListener('click', () => {
  const camera = viewer.getCamera();
  const newFov = Math.min(maxFov, camera.fov + ZOOM_STEP); // Prevent zooming out too much
  smoothZoom(newFov);
});

// Toggle infospots
let infospotsVisible = true;
toggleInfospotsBtn.addEventListener('click', () => {
  infospotsVisible = !infospotsVisible;
  viewer.panorama.children.forEach((child) => {
      if (child instanceof PANOLENS.Infospot) {
          child.visible = infospotsVisible;
      }
  });
});














// Initialize the viewer and load the first panorama
initializeViewer(returnCameraFOV());
loadPanormas();
window.loadPanorama = loadPanorama;

window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');
  preloader.style.opacity = '0';
  preloader.style.visibility = 'hidden';

});


