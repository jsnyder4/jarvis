// Sports Service - ESPN API Integration
// Fetches scores, schedules, and standings for soccer leagues

class SportsService {
  constructor() {
    this.scoreboardBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
    this.standingsBaseUrl = 'https://site.api.espn.com/apis/v2/sports';
    this.cache = new Map();
    this.refreshTimer = null;
    
    // League configurations
    this.leagues = {
      mls: {
        code: 'usa.1',
        name: 'MLS',
        fullName: 'Major League Soccer',
        sport: 'soccer',
        logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png'
      },
      premierLeague: {
        code: 'eng.1',
        name: 'Premier League',
        fullName: 'English Premier League',
        sport: 'soccer',
        logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png'
      },
      laLiga: {
        code: 'esp.1',
        name: 'La Liga',
        fullName: 'Spanish La Liga',
        sport: 'soccer',
        logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png'
      },
      nfl: {
        code: 'nfl',
        name: 'NFL',
        fullName: 'National Football League',
        sport: 'football',
        logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png'
      }
    };
  }

  /**
   * Get scoreboard data for a league
   * @param {string} leagueKey - League key (mls, premierLeague, laLiga)
   * @returns {Promise<Object>} Scoreboard data
   */
  async getScoreboard(leagueKey) {
    const league = this.leagues[leagueKey];
    if (!league) {
      throw new Error(`Unknown league: ${leagueKey}`);
    }

    const cacheKey = `scoreboard-${leagueKey}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.scoreboardBaseUrl}/${league.sport}/${league.code}/scoreboard`;
      console.log(`[SportsService] Fetching scoreboard for ${league.name}:`, url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and simplify the data
      const processed = this.processScoreboard(data, league);
      
      // Cache for 5 minutes during live games, 60 minutes otherwise
      const hasLiveGames = processed.events.some(e => e.isLive);
      const cacheMinutes = hasLiveGames ? 5 : 60;
      this.setCached(cacheKey, processed, cacheMinutes);

      return processed;
    } catch (error) {
      console.error(`[SportsService] Error fetching ${league.name} scoreboard:`, error);
      throw error;
    }
  }

  /**
   * Get standings for a league
   * @param {string} leagueKey - League key
   * @returns {Promise<Object>} Standings data
   */
  async getStandings(leagueKey) {
    const league = this.leagues[leagueKey];
    if (!league) {
      throw new Error(`Unknown league: ${leagueKey}`);
    }

    const cacheKey = `standings-${leagueKey}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.standingsBaseUrl}/${league.sport}/${league.code}/standings`;
      console.log(`[SportsService] Fetching standings for ${league.name}:`, url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      const processed = this.processStandings(data, league);
      
      // Cache standings for 24 hours (they don't change often)
      this.setCached(cacheKey, processed, 1440);

      return processed;
    } catch (error) {
      console.error(`[SportsService] Error fetching ${league.name} standings:`, error);
      throw error;
    }
  }

  /**
   * Get all data for multiple leagues
   * @param {Array<string>} leagueKeys - Array of league keys to fetch
   * @returns {Promise<Object>} Object with scoreboards and standings for each league
   */
  async getAllLeagues(leagueKeys) {
    const results = {};
    
    for (const leagueKey of leagueKeys) {
      try {
        const [scoreboard, standings] = await Promise.all([
          this.getScoreboard(leagueKey),
          this.getStandings(leagueKey)
        ]);
        
        results[leagueKey] = {
          scoreboard,
          standings,
          league: this.leagues[leagueKey]
        };
      } catch (error) {
        console.error(`[SportsService] Error fetching ${leagueKey}:`, error);
        results[leagueKey] = {
          error: error.message,
          league: this.leagues[leagueKey]
        };
      }
    }

    return results;
  }

  /**
   * Process raw ESPN scoreboard data into simplified format
   */
  processScoreboard(data, league) {
    const events = (data.events || []).map(event => {
      const competition = event.competitions?.[0];
      const status = event.status;
      
      // Get home and away teams
      const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
      const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');

      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: new Date(event.date),
        
        // Status
        isLive: status?.type?.state === 'in',
        isCompleted: status?.type?.completed || false,
        statusText: status?.type?.shortDetail || status?.type?.detail,
        clock: status?.displayClock,
        period: status?.period,
        
        // Teams
        homeTeam: {
          id: homeTeam?.id,
          name: homeTeam?.team?.displayName,
          shortName: homeTeam?.team?.shortDisplayName,
          abbreviation: homeTeam?.team?.abbreviation,
          logo: homeTeam?.team?.logo,
          score: homeTeam?.score,
          record: homeTeam?.records?.[0]?.summary,
          winner: homeTeam?.winner
        },
        awayTeam: {
          id: awayTeam?.id,
          name: awayTeam?.team?.displayName,
          shortName: awayTeam?.team?.shortDisplayName,
          abbreviation: awayTeam?.team?.abbreviation,
          logo: awayTeam?.team?.logo,
          score: awayTeam?.score,
          record: awayTeam?.records?.[0]?.summary,
          winner: awayTeam?.winner
        },
        
        // Additional info
        venue: competition?.venue?.fullName,
        broadcast: competition?.broadcasts?.[0]?.names?.join(', ')
      };
    });

    return {
      league: league.name,
      fullName: league.fullName,
      season: data.season,
      events,
      lastUpdated: new Date()
    };
  }

  /**
   * Process raw ESPN standings data into simplified format
   */
  processStandings(data, league) {
    if (!data.children || data.children.length === 0) {
      return {
        league: league.name,
        fullName: league.fullName,
        tables: [],
        lastUpdated: new Date()
      };
    }

    // NFL division mapping
    const nflDivisions = {
      // AFC
      'Buffalo Bills': 'AFC East',
      'Miami Dolphins': 'AFC East',
      'New England Patriots': 'AFC East',
      'New York Jets': 'AFC East',
      'Baltimore Ravens': 'AFC North',
      'Cincinnati Bengals': 'AFC North',
      'Cleveland Browns': 'AFC North',
      'Pittsburgh Steelers': 'AFC North',
      'Houston Texans': 'AFC South',
      'Indianapolis Colts': 'AFC South',
      'Jacksonville Jaguars': 'AFC South',
      'Tennessee Titans': 'AFC South',
      'Denver Broncos': 'AFC West',
      'Kansas City Chiefs': 'AFC West',
      'Las Vegas Raiders': 'AFC West',
      'Los Angeles Chargers': 'AFC West',
      // NFC
      'Dallas Cowboys': 'NFC East',
      'New York Giants': 'NFC East',
      'Philadelphia Eagles': 'NFC East',
      'Washington Commanders': 'NFC East',
      'Chicago Bears': 'NFC North',
      'Detroit Lions': 'NFC North',
      'Green Bay Packers': 'NFC North',
      'Minnesota Vikings': 'NFC North',
      'Atlanta Falcons': 'NFC South',
      'Carolina Panthers': 'NFC South',
      'New Orleans Saints': 'NFC South',
      'Tampa Bay Buccaneers': 'NFC South',
      'Arizona Cardinals': 'NFC West',
      'Los Angeles Rams': 'NFC West',
      'San Francisco 49ers': 'NFC West',
      'Seattle Seahawks': 'NFC West'
    };

    // Process each conference/division
    const allTables = [];
    
    data.children.forEach(conference => {
      const standingsData = conference.standings;
      
      if (!standingsData || !standingsData.entries) {
        return;
      }

      // For NFL, group teams by division
      const isNFL = league.sport === 'football' && league.code === 'nfl';
      
      if (isNFL) {
        // Group teams by division
        const divisions = {};
        
        standingsData.entries.forEach(entry => {
          const team = entry.team;
          const divisionName = nflDivisions[team.displayName];
          
          if (!divisionName) {
            console.warn(`[SportsService] Unknown NFL team division: ${team.displayName}`);
            return;
          }
          
          if (!divisions[divisionName]) {
            divisions[divisionName] = [];
          }
          
          const stats = {};
          (entry.stats || []).forEach(stat => {
            stats[stat.name] = {
              value: stat.value,
              displayValue: stat.displayValue
            };
          });

          divisions[divisionName].push({
            position: stats.playoffSeed?.value || stats.rank?.value,
            team: {
              id: team.id,
              name: team.displayName,
              shortName: team.shortDisplayName,
              abbreviation: team.abbreviation,
              logo: team.logos?.[0]?.href
            },
            stats: {
              gamesPlayed: stats.gamesPlayed?.value,
              wins: stats.wins?.value,
              losses: stats.losses?.value,
              ties: stats.ties?.value,
              points: stats.points?.value,
              pointDifferential: stats.pointDifferential?.value,
              goalsFor: stats.pointsFor?.value,
              goalsAgainst: stats.pointsAgainst?.value,
              ppg: stats.ppg?.displayValue,
              form: stats.form?.displayValue,
              winPercent: stats.winPercent?.displayValue,
              streak: stats.streak?.displayValue
            },
            note: entry.note
          });
        });
        
        // Create a table for each division
        Object.keys(divisions).sort().forEach(divisionName => {
          allTables.push({
            name: divisionName.toLowerCase().replace(/ /g, '_'),
            displayName: divisionName,
            conferenceName: divisionName,
            conferenceAbbr: divisionName.split(' ')[1], // "East", "North", etc.
            entries: divisions[divisionName].sort((a, b) => (a.position || 99) - (b.position || 99))
          });
        });
        
      } else {
        // Soccer leagues - single table per conference
        const entries = (standingsData.entries || []).map(entry => {
          const team = entry.team;
          const stats = {};
          
          (entry.stats || []).forEach(stat => {
            stats[stat.name] = {
              value: stat.value,
              displayValue: stat.displayValue
            };
          });

          return {
            position: stats.rank?.value,
            team: {
              id: team.id,
              name: team.displayName,
              shortName: team.shortDisplayName,
              abbreviation: team.abbreviation,
              logo: team.logos?.[0]?.href
            },
            stats: {
              gamesPlayed: stats.gamesPlayed?.value,
              wins: stats.wins?.value,
              losses: stats.losses?.value,
              ties: stats.ties?.value,
              points: stats.points?.value,
              pointDifferential: stats.pointDifferential?.value,
              goalsFor: stats.pointsFor?.value,
              goalsAgainst: stats.pointsAgainst?.value,
              ppg: stats.ppg?.displayValue,
              form: stats.form?.displayValue
            },
            note: entry.note
          };
        });

        allTables.push({
          name: standingsData.name,
          displayName: standingsData.displayName,
          conferenceName: conference.name,
          conferenceAbbr: conference.abbreviation,
          entries
        });
      }
    });

    return {
      league: league.name,
      fullName: league.fullName,
      tables: allTables,
      lastUpdated: new Date()
    };
  }

  /**
   * Cache management
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[SportsService] Using cached data for ${key}`);
    return cached.data;
  }

  setCached(key, data, minutes) {
    const expiresAt = Date.now() + (minutes * 60 * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
const sportsService = new SportsService();
