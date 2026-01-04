// Main application entry point
console.log('Jarvis Dashboard starting...');

let timeComponent;
let weatherComponent;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing components...');
  
  // Initialize time component
  timeComponent = new TimeComponent('time-container');
  timeComponent.start();
  
  // Initialize weather component
  weatherComponent = new WeatherComponent('weather-container');
  weatherComponent.start();
  
  console.log('✅ Jarvis Dashboard ready!');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (timeComponent) timeComponent.stop();
  if (weatherComponent) weatherComponent.stop();
});
