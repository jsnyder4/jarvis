// Main application entry point
console.log('Jarvis Dashboard starting...');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing navigation system...');
  
  // Register all pages
  const homePage = new HomePage();
  const weatherPage = new WeatherPage();
  const calendarPage = new CalendarPage();
  const photosPage = new PhotosPage();
  const sportsPage = new SportsPage();
  const listsPage = new ListsPage();
  
  pageManager.registerPage('home', homePage);
  pageManager.registerPage('weather', weatherPage);
  pageManager.registerPage('calendar', calendarPage);
  pageManager.registerPage('photos', photosPage);
  pageManager.registerPage('sports', sportsPage);
  pageManager.registerPage('lists', listsPage);
  
  // Navigate to home page by default
  pageManager.navigateTo('home');
  
  console.log('✅ Jarvis Dashboard ready with 6 pages!');
});
