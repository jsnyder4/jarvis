// Sports Page - ESPN API Integration

class SportsPage extends BasePage {
  constructor() {
    super('sports', 'page-sports');
    this.selectedLeague = null;
    this.leagueData = {};
    this.refreshInterval = null;
  }

  async render() {
    if (!this.container) return;

    // Initial loading state
    this.container.innerHTML = `
      <div class="h-full overflow-hidden pb-24 sports-page">
        <!-- Header -->
        <div class="px-8 pt-8 pb-4">
          <h1 class="text-2xl font-bold text-gray-800">Sports</h1>
        </div>

        <!-- League Selector -->
        <div class="bg-white border-b border-gray-200">
          <div class="flex space-x-2 p-3 px-8" id="league-tabs">
            <div class="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
            <div class="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
            <div class="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
          </div>
        </div>

        <!-- Content Area -->
        <div id="sports-content" class="p-4 px-8">
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin text-6xl mb-4">⚽</div>
              <p class="text-xl text-gray-600">Loading sports data...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load data
    await this.loadSportsData();
  }

  async loadSportsData() {
    try {
      // Get leagues from config
      const leagues = CONFIG.sports?.leagues || ['mls', 'premierLeague', 'laLiga'];
      
      // Fetch all league data
      this.leagueData = await sportsService.getAllLeagues(leagues);
      
      // Select first league by default
      this.selectedLeague = leagues[0];
      
      // Render league tabs and content
      this.renderLeagueTabs();
      this.renderLeagueContent();
      
    } catch (error) {
      console.error('[SportsPage] Error loading sports data:', error);
      this.renderError(error);
    }
  }

  renderLeagueTabs() {
    const tabsContainer = document.getElementById('league-tabs');
    if (!tabsContainer) return;

    const leagues = CONFIG.sports?.leagues || ['mls', 'premierLeague', 'laLiga'];
    
    tabsContainer.innerHTML = leagues.map(leagueKey => {
      const data = this.leagueData[leagueKey];
      const isSelected = leagueKey === this.selectedLeague;
      const leagueName = data?.league?.name || leagueKey;
      
      return `
        <button 
          class="league-tab px-5 py-2 rounded-lg font-semibold text-base transition-all ${
            isSelected 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }"
          data-league="${leagueKey}"
        >
          ${leagueName}
        </button>
      `;
    }).join('');

    // Add click handlers
    tabsContainer.querySelectorAll('.league-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.selectedLeague = e.target.dataset.league;
        this.renderLeagueTabs();
        this.renderLeagueContent();
      });
    });
  }

  renderLeagueContent() {
    const contentContainer = document.getElementById('sports-content');
    if (!contentContainer) return;

    const data = this.leagueData[this.selectedLeague];
    
    if (!data) {
      contentContainer.innerHTML = '<p class="text-center text-gray-500 py-12">No data available</p>';
      return;
    }

    if (data.error) {
      contentContainer.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div class="text-4xl mb-2">⚠️</div>
          <p class="text-red-800 font-semibold">Error loading ${data.league.name}</p>
          <p class="text-red-600 text-sm mt-2">${data.error}</p>
        </div>
      `;
      return;
    }

    // Render with two-column layout: standings left (wider), scores right (narrower)
    contentContainer.innerHTML = `
      <div class="grid gap-6 h-full" style="grid-template-columns: 60% 38%;">
        <!-- Left: Standings (wider) -->
        <div id="standings-scroll" class="sports-scroll" style="max-height: calc(100vh - 280px); -webkit-overflow-scrolling: touch; touch-action: pan-y; cursor: grab;">
          ${this.renderStandings(data.standings)}
        </div>
        
        <!-- Right: Scores (narrower) -->
        <div id="scores-scroll" class="sports-scroll" style="max-height: calc(100vh - 280px); -webkit-overflow-scrolling: touch; touch-action: pan-y; cursor: grab;">
          ${this.renderScoreboard(data.scoreboard)}
        </div>
      </div>
    `;
    
    // Setup touch scrolling for both containers
    this.setupTouchScroll('standings-scroll');
    this.setupTouchScroll('scores-scroll');
  }

  setupTouchScroll(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let startY = 0;
    let startScrollTop = 0;
    let isDragging = false;

    element.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = element.scrollTop;
      element.style.cursor = 'grabbing';
      e.preventDefault();
    });

    element.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      
      const deltaY = startY - e.clientY;
      element.scrollTop = startScrollTop + deltaY;
      e.preventDefault();
    });

    element.addEventListener('pointerup', () => {
      isDragging = false;
      element.style.cursor = 'grab';
    });

    element.addEventListener('pointerleave', () => {
      isDragging = false;
      element.style.cursor = 'grab';
    });
  }

  renderScoreboard(scoreboard) {
    if (!scoreboard || !scoreboard.events || scoreboard.events.length === 0) {
      return `
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Scores & Schedule</h2>
          <div class="bg-gray-50 rounded-lg p-6 text-center">
            <p class="text-gray-500">No games scheduled</p>
          </div>
        </div>
      `;
    }

    // Separate games by status (show all games)
    const liveGames = scoreboard.events.filter(e => e.isLive);
    const upcomingGames = scoreboard.events.filter(e => !e.isLive && !e.isCompleted);
    const completedGames = scoreboard.events.filter(e => e.isCompleted);

    return `
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Scores & Schedule</h2>
        
        <div class="space-y-3">
          ${liveGames.map(game => this.renderGameCard(game, true)).join('')}
          ${upcomingGames.map(game => this.renderGameCard(game, false)).join('')}
          ${completedGames.map(game => this.renderGameCard(game, false)).join('')}
        </div>
      </div>
    `;
  }

  renderGameCard(game, isLive) {
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    };

    return `
      <div class="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow ${isLive ? 'border-l-4 border-red-500' : 'border border-gray-200'}">
        ${isLive ? `
          <div class="flex items-center text-xs text-red-600 font-semibold mb-2">
            <span class="inline-block w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
            LIVE - ${game.statusText}
          </div>
        ` : ''}
        
        <div class="flex items-center justify-between">
          <!-- Away Team -->
          <div class="flex items-center space-x-2 flex-1 min-w-0">
            ${game.awayTeam.logo ? `<img src="${game.awayTeam.logo}" alt="${game.awayTeam.name}" class="w-8 h-8 flex-shrink-0">` : ''}
            <div class="min-w-0 flex-1">
              <div class="font-semibold text-sm ${game.awayTeam.winner ? 'text-blue-600' : 'text-gray-800'} truncate">
                ${game.awayTeam.shortName || game.awayTeam.name}
              </div>
            </div>
          </div>

          <!-- Score / Time -->
          <div class="px-4 text-center flex-shrink-0">
            ${game.isLive || game.isCompleted ? `
              <div class="text-2xl font-bold text-gray-900">${game.awayTeam.score} - ${game.homeTeam.score}</div>
            ` : `
              <div class="text-sm font-semibold text-gray-600">${formatTime(game.date)}</div>
              <div class="text-xs text-gray-500">${formatDate(game.date)}</div>
            `}
          </div>

          <!-- Home Team -->
          <div class="flex items-center justify-end space-x-2 flex-1 min-w-0">
            <div class="min-w-0 flex-1 text-right">
              <div class="font-semibold text-sm ${game.homeTeam.winner ? 'text-blue-600' : 'text-gray-800'} truncate">
                ${game.homeTeam.shortName || game.homeTeam.name}
              </div>
            </div>
            ${game.homeTeam.logo ? `<img src="${game.homeTeam.logo}" alt="${game.homeTeam.name}" class="w-8 h-8 flex-shrink-0">` : ''}
          </div>
        </div>
        
        ${!isLive && game.isCompleted ? `
          <div class="mt-1 text-xs text-gray-500 text-center">${game.statusText}</div>
        ` : ''}
        
        ${game.venue || game.broadcast ? `
          <div class="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span class="truncate">${game.venue || ''}</span>
            <span class="flex-shrink-0 ml-2">${game.broadcast || ''}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderStandings(standings) {
    if (!standings || !standings.tables || standings.tables.length === 0) {
      return `
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Standings</h2>
          <div class="bg-gray-50 rounded-lg p-6 text-center">
            <p class="text-gray-500">No standings available</p>
          </div>
        </div>
      `;
    }

    // Check if there are multiple conferences (like MLS East/West or NFL AFC/NFC)
    const hasMultipleConferences = standings.tables.length > 1;
    const isNFL = this.selectedLeague === 'nfl';

    return `
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Standings</h2>
        
        ${isNFL ? `
          <!-- NFL: 4 divisions per conference, 2 columns -->
          <div class="space-y-2">
            ${this.renderNFLConference(standings.tables.filter(t => t.conferenceName.startsWith('AFC')))}
            ${this.renderNFLConference(standings.tables.filter(t => t.conferenceName.startsWith('NFC')))}
          </div>
        ` : hasMultipleConferences ? `
          <!-- MLS: 2 conferences side by side -->
          <div class="grid grid-cols-2 gap-3">
            ${standings.tables.map(table => this.renderStandingsTable(table)).join('')}
          </div>
        ` : `
          <!-- Single table layout (Premier League, La Liga) -->
          ${standings.tables.map(table => this.renderStandingsTable(table)).join('')}
        `}
      </div>
    `;
  }

  renderNFLConference(divisions) {
    if (!divisions || divisions.length === 0) return '';
    
    const conferenceName = divisions[0].conferenceName.split(' ')[0]; // "AFC" or "NFC"
    
    return `
      <div class="mb-2">
        <h3 class="text-lg font-bold text-gray-700 mb-1">${conferenceName}</h3>
        <div class="grid grid-cols-2 gap-2">
          ${divisions.map(table => this.renderStandingsTable(table)).join('')}
        </div>
      </div>
    `;
  }

  renderStandingsTable(table) {
    // For MLS and NFL, hide GD column
    const isMLS = this.selectedLeague === 'mls';
    const isNFL = this.selectedLeague === 'nfl';
    const hideGD = isMLS || isNFL;
    
    return `
      <div>
        ${table.conferenceName ? `
          <h3 class="text-sm font-semibold text-gray-700 mb-1">${table.conferenceName}</h3>
        ` : ''}
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full" style="font-size: 0.7rem;">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                ${isNFL ? '' : `<th class="px-1 py-1 text-left font-semibold text-gray-700">#</th>`}
                <th class="px-1 py-1 text-left font-semibold text-gray-700">Team</th>
                ${!isNFL ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">GP</th>` : ''}
                <th class="px-1 py-1 text-center font-semibold text-gray-700">W</th>
                <th class="px-1 py-1 text-center font-semibold text-gray-700">L</th>
                ${isNFL ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">T</th>` : ''}
                ${!isNFL && !hideGD ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">D</th>` : ''}
                ${!hideGD && !isNFL ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">GD</th>` : ''}
                ${isNFL ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">PCT</th>` : ''}
                ${isNFL ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">STRK</th>` : ''}
                ${!isNFL ? `<th class="px-1 py-1 text-center font-semibold text-gray-700">PTS</th>` : ''}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${table.entries.map((entry, idx) => `
                <tr class="hover:bg-gray-50 transition-colors">
                  ${isNFL ? '' : `<td class="px-1 py-1 font-semibold text-gray-700">${entry.position || idx + 1}</td>`}
                  <td class="px-1 py-1">
                    <div class="flex items-center space-x-1">
                      ${entry.team.logo ? `<img src="${entry.team.logo}" alt="${entry.team.name}" class="w-3 h-3 flex-shrink-0">` : ''}
                      <span class="font-medium text-gray-900 truncate">${entry.team.abbreviation || entry.team.shortName}</span>
                    </div>
                  </td>
                  ${!isNFL ? `<td class="px-1 py-1 text-center text-gray-600">${entry.stats.gamesPlayed || 0}</td>` : ''}
                  <td class="px-1 py-1 text-center text-gray-600">${entry.stats.wins || 0}</td>
                  <td class="px-1 py-1 text-center text-gray-600">${entry.stats.losses || 0}</td>
                  ${isNFL ? `<td class="px-1 py-1 text-center text-gray-600">${entry.stats.ties || 0}</td>` : ''}
                  ${!isNFL && !hideGD ? `<td class="px-1 py-1 text-center text-gray-600">${entry.stats.ties || 0}</td>` : ''}
                  ${!hideGD && !isNFL ? `
                    <td class="px-1 py-1 text-center font-medium ${
                      entry.stats.pointDifferential > 0 ? 'text-green-600' : 
                      entry.stats.pointDifferential < 0 ? 'text-red-600' : 'text-gray-600'
                    }">${entry.stats.pointDifferential > 0 ? '+' : ''}${entry.stats.pointDifferential || 0}</td>
                  ` : ''}
                  ${isNFL ? `<td class="px-1 py-1 text-center text-gray-600">${entry.stats.winPercent || '-'}</td>` : ''}
                  ${isNFL ? `<td class="px-1 py-1 text-center text-gray-600">${entry.stats.streak || '-'}</td>` : ''}
                  ${!isNFL ? `<td class="px-1 py-1 text-center font-bold text-blue-600">${entry.stats.points || 0}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderError(error) {
    const contentContainer = document.getElementById('sports-content');
    if (!contentContainer) return;

    contentContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <p class="text-xl text-red-800 font-semibold mb-2">Error Loading Sports Data</p>
        <p class="text-red-600">${error.message}</p>
        <button 
          onclick="pageManager.currentPage.loadSportsData()" 
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    `;
  }

  onShow() {
    // Start auto-refresh when page is shown
    this.startAutoRefresh();
  }

  onHide() {
    // Stop auto-refresh when page is hidden
    this.stopAutoRefresh();
  }

  startAutoRefresh() {
    // Refresh every 5 minutes for live games, or based on config
    const refreshMinutes = CONFIG.sports?.liveRefreshInterval || 5;
    this.refreshInterval = setInterval(() => {
      console.log('[SportsPage] Auto-refreshing sports data...');
      this.loadSportsData();
    }, refreshMinutes * 60 * 1000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}
