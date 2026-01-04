// Main application entry point
console.log('Jarvis Dashboard starting...');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  // Simple test - update the UI
  setTimeout(() => {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="text-center">
        <h1 class="text-6xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
          Jarvis Dashboard
        </h1>
        <p class="text-2xl text-green-600 mb-2">✓ Auto-reload is working!</p>
        <p class="text-lg text-gray-500 mb-8">Try editing this file to see instant updates</p>
        
        <div class="mt-8 grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow border border-blue-200">
            <div class="text-5xl mb-3">🌤️</div>
            <h2 class="text-3xl font-bold text-blue-800 mb-2">Time & Weather</h2>
            <p class="text-blue-600">Real-time clock and forecast</p>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow border border-purple-200">
            <div class="text-5xl mb-3">📅</div>
            <h2 class="text-3xl font-bold text-purple-800 mb-2">Calendar</h2>
            <p class="text-purple-600">iCal integration with multi-color support</p>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow border border-green-200">
            <div class="text-5xl mb-3">⚽</div>
            <h2 class="text-3xl font-bold text-green-800 mb-2">Sports</h2>
            <p class="text-green-600">Live scores, standings & schedules</p>
          </div>
          
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow border border-orange-200">
            <div class="text-5xl mb-3">📝</div>
            <h2 class="text-3xl font-bold text-orange-800 mb-2">Lists</h2>
            <p class="text-orange-600">Shopping and task management</p>
          </div>
        </div>
      </div>
    `;
  }, 1000);
});
