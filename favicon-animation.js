/**
 * Infinite Blue-White Neon Favicon Animation
 * Creates a vibrant blue-white neon blinking animation in the favicon when tab is inactive
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initAnimatedFavicon();
});

function initAnimatedFavicon() {
  // console.logg("Initializing infinite blue-white neon favicon animation...");
  
  // Create hidden canvas element if it doesn't exist
  let canvas = document.querySelector('canvas[data-favicon-canvas]');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('data-favicon-canvas', 'true');
    canvas.width = 32;
    canvas.height = 32;
    canvas.hidden = true;
    document.body.appendChild(canvas);
  }
  
  // Get favicon element
  const favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    console.error("No favicon element found");
    return;
  }
  
  // Save original favicon
  const originalFavicon = favicon.href;
  
  // Get canvas context
  const context = canvas.getContext('2d');
  if (!context) {
    console.error("Canvas context not available");
    return;
  }
  
  // Variables for animation
  let n = 0;
  let blinkState = 0; // 0 = blue, 1 = white
  let loadingInterval = null;
  let blinkInterval = null;
  let isAnimating = false;
  
  // Only blue and white color palettes (2 alternating states)
const neonPalettes = [
  {
  primary: '#33CCFF', 
  secondary: '#66D9EF', 
  glow: '#99FFFF', 
  shadow: '#0097A7'
  }, 
  {
    primary: '#FFFFFF', 
    secondary: '#F0F8FF', 
    glow: '#E6F7FF', 
    shadow: '#99CCFF'
  }  
];
  
  // Function to draw the loader with blue-white neon effect
  function drawLoader() {
    // Clear canvas
    context.clearRect(0, 0, 32, 32);
    
    // Get current neon palette based on blink state
    const palette = neonPalettes[blinkState];
    
    // Add glow effect by drawing a larger shadow first
    context.shadowColor = palette.glow;
    context.shadowBlur = 8; // Increased glow
    context.lineWidth = 3;
    context.strokeStyle = palette.primary;
    
    // Draw the square outline
    context.beginPath();
    
    // Draw the square based on the progress value
    // Up to 25% - draw top line (faster progression)
    if (n <= 25) {
      context.moveTo(0, 0);
      context.lineTo((32/25) * n, 0);
    }
    // 25% to 50% - draw top and right lines
    else if (n > 25 && n <= 50) {
      context.moveTo(0, 0);
      context.lineTo(32, 0);
      context.moveTo(32, 0);
      context.lineTo(32, (32/25) * (n-25));
    }
    // 50% to 75% - draw top, right and bottom lines
    else if (n > 50 && n <= 75) {
      context.moveTo(0, 0);
      context.lineTo(32, 0);
      context.moveTo(32, 0);
      context.lineTo(32, 32);
      context.moveTo(32, 32);
      context.lineTo(32 - ((32/25) * (n-50)), 32);
    }
    // 75% to 100% - draw all four lines
    else if (n > 75 && n <= 100) {
      context.moveTo(0, 0);
      context.lineTo(32, 0);
      context.moveTo(32, 0);
      context.lineTo(32, 32);
      context.moveTo(32, 32);
      context.lineTo(0, 32);
      context.moveTo(0, 32);
      context.lineTo(0, 32 - ((32/25) * (n-75)));
    }
    
    context.stroke();
    
    // Add inner glow
    context.shadowBlur = 0;
    context.fillStyle = `rgba(${hexToRgb(palette.glow)}, 0.3)`;
    context.fillRect(4, 4, 24, 24);
    
    // Add small bright center for extra "neon tube" effect
    context.fillStyle = `rgba(${hexToRgb(palette.primary)}, 0.6)`;
    context.fillRect(8, 8, 16, 16);
    
    // Update favicon with the canvas content
    favicon.href = canvas.toDataURL('image/png');
    
    // Ensure animation is truly infinite
    if (n >= 100) {
      n = 0; // Reset to start the square drawing again
    } else {
      n += 4; // Even faster progression for more vibrant effect
    }
  }
  
  // Helper function to convert hex color to RGB for rgba()
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }
  
  // Function to alternate between blue and white
  function alternateColors() {
    blinkState = blinkState === 0 ? 1 : 0;
  }
  
  // Start animation with blue-white blinking effect
  function startAnimation() {
    if (isAnimating) return;
    
    // console.logg("Starting infinite blue-white neon favicon animation");
    isAnimating = true;
    n = 0;
    blinkState = 0;
    
    // Very fast animation for neon effect (25ms)
    loadingInterval = setInterval(drawLoader, 25);
    
    // Rapidly alternate between blue and white (300ms)
    blinkInterval = setInterval(alternateColors, 300);
  }
  
  // Stop animation and reset
  function stopAnimation() {
    if (!isAnimating) return;
    
    // console.logg("Stopping neon favicon animation");
    isAnimating = false;
    clearInterval(loadingInterval);
    clearInterval(blinkInterval);
    favicon.href = originalFavicon;
  }
  
  // Start/stop animation based on tab visibility
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // Start animation when tab becomes hidden
      startAnimation();
    } else {
      // Stop animation when tab becomes visible again
      stopAnimation();
    }
  });
  
  // Additional check to handle browsers that don't properly support visibilitychange
  setInterval(function() {
    if (document.hidden && !isAnimating) {
      startAnimation();
    } else if (!document.hidden && isAnimating) {
      stopAnimation();
    }
  }, 1000);
  
  // Force animation to continue even if browser throttles inactive tabs
  window.addEventListener('blur', function() {
    startAnimation();
  });
  
  // Provide a way to test the animation
  window.testFaviconAnimation = function(duration = 0) {
    if (isAnimating) {
      stopAnimation();
    }
    
    startAnimation();
    
    if (duration > 0) {
      setTimeout(stopAnimation, duration);
    }
  };
  
  // console.logg("Infinite blue-white neon favicon animation initialized");
}