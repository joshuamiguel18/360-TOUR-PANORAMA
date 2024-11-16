  import { panoramas } from './data.js';

  let viewer;
  let panoramaImage;

  const imageContainer = document.querySelector(".image-container");

  var tabs = document.getElementById('tabs');
  function loadButtons() {
    tabs.innerHTML = '';
    panoramas.forEach((panorama, key)=> {

        tabs.innerHTML += `<button class="tab" onclick="loadPanorama(${key})">
              <img src="${panorama.imagePath}" alt="image" />
              <span class="tooltip">Place 2</span>
            </button>`;
    });
  }

  const gsapScript = document.createElement("script");
  gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
  document.head.appendChild(gsapScript);


  // Initialize the viewer
  function initializeViewer() {
    viewer = new PANOLENS.Viewer({
      container: imageContainer,
      autoRotate: true,
      autoRotateSpeed: 0.6,
      controlBar: false,
      viewIndicator: true,
      reverseDragging: false,
      cameraFov: 60,
      momentum: false,
      autoHideInfosport: false,
    });
    
      loadButtons();
      loadPanorama(0); // Load the first panorama by defaults
      const maxFov = 90; // Maximum zoom-out
      const minFov = 30;  // Minimum zoom-in
      
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
  viewer.container.addEventListener('touchstart', onTouchStart, { passive: false });
  viewer.container.addEventListener('touchmove', onTouchMove, { passive: false });

  let initialTouchDistance = 0;

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


      viewer.OrbitControls.addEventListener('start', () => {
        imageContainer.classList.add('dragging');
      });
      
      viewer.OrbitControls.addEventListener('end', () => {
        imageContainer.classList.remove('dragging');
      });

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
            hotspot.element.addEventListener('mouseenter', () => {
              imageContainer.style.cursor = 'pointer';
            });
          
            hotspot.element.addEventListener('mouseleave', () => {
              imageContainer.style.cursor = imageContainer.classList.contains('dragging') ? 'grabbing' : 'grab';
            });
          });
        }

        // Add the hotspot to the panorama
        panoramaImage.add(hotspot);
        setTimeout(() => {hidePreloader()}, 200);
        
      });
    }, 500); // 500ms delay for the fade effect
        // Hide preloader
    
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

  
  function openFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen(); // For standard browsers
    } else if (document.documentElement.webkitRequestFullscreen) { // For Safari
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // For IE11
      document.documentElement.msRequestFullscreen();
    }
  }
  
  // Function to exit fullscreen
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen(); // For standard browsers
    } else if (document.webkitExitFullscreen) { // For Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // For IE11
      document.msExitFullscreen();
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      console.log("Entered fullscreen mode");
    } else {
      console.log("Exited fullscreen mode");
    }
  });
  
  // Add a button to toggle fullscreen
  const fullscreenButton = document.createElement("button");
  fullscreenButton.innerHTML = "Go Fullscreen";
  fullscreenButton.style.position = "absolute";
  fullscreenButton.style.top = "10px";
  fullscreenButton.style.left = "10px";
  fullscreenButton.style.zIndex = "1000"; // Ensure button is on top
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      openFullscreen(); // Enter fullscreen
    } else {
      closeFullscreen(); // Exit fullscreen
    }
  });
  
  // Add the button to the body or any specific container
  document.body.appendChild(fullscreenButton);








  




  // Initialize the viewer and load the first panorama
  initializeViewer();

  window.loadPanorama = loadPanorama;

  window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';

  });


