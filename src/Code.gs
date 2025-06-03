// ============================
// CONFIGURATION
// ============================
const CONFIG = {
  // Master sheet name where dashboard will be created
  MASTER_SHEET_NAME: 'Master Tracker Dashboard',
  
  // Project target
  PROJECT_TARGET: 5000,
  
  // Team sheets configuration
  TEAM_WEEKS: {
    week_1: [
     {
        id: '',// Google Sheet id here
        name: 'Team 1',
        leadName: 'John',
        developers: 7,
        weeklyCapacity: 100,
        weekNumber: 1
      },
      {
        id: '', // Google Sheet id here
        name: 'Team 2',
        leadName: 'David',
        developers: 7,
        weeklyCapacity: 100,
        weekNumber: 1
      },
      {
        id: '',
        name: 'Team 3', 
        leadName: 'Alex',
        developers: 7,
        weeklyCapacity: 100,
        weekNumber: 1
      },
      {
        id: '',
        name: 'Team 4', 
        leadName: 'Joe',
        developers: 6,
        weeklyCapacity: 150,
        weekNumber: 1
      }
    ],
    week_2: [
      // Add Week 2 team sheet configurations here
    ],
    week_3: [
      // Add Week 3 team sheet configurations here
    ]
  },
  
  // Column mappings
  STATUS_COLUMN: 'status',
  SERIAL_COLUMN: 'sr_no',
  REPO_COLUMN: 'repo_name',
  
  // Status values mapping
  STATUS_VALUES: {
    NOT_STARTED: ['Not Started', 'TODO', 'Backlog', '', 'Pending', 'New'],
    IN_PROGRESS: ['In-Progress', 'Working', 'Started', 'Assigned', 'Development', 'Coding'],
    REVIEW: ['Ready for Review', 'In-Review', 'Review', 'Under Review', 'Reviewing'],
    COMPLETED: ['Completed', 'Done', 'Finished', 'Closed', 'Deployed', 'Live'],
    ISSUES: ['In-Complete Data', 'Incomplete Data', 'Data Issues', 'Missing Data', 'Invalid Data', 'Data Problem']
  },
  
  // Dashboard styling
  COLORS: {
    HEADER: '#1a73e8',
    COMPLETED: '#34a853',
    IN_PROGRESS: '#fbbc04',
    REVIEW: '#4285f4',
    NOT_STARTED: '#9e9e9e',
    ISSUES: '#ea4335',
    BORDER: '#dadce0',
    LIGHT_GRAY: '#f8f9fa'
  }
};

// ============================
// MAIN FUNCTIONS
// ============================

/**
 * Creates or updates the master tracker dashboard
 */
function createMasterTracker() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let masterSheet = ss.getSheetByName(CONFIG.MASTER_SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!masterSheet) {
      masterSheet = ss.insertSheet(CONFIG.MASTER_SHEET_NAME);
    }
    
    // Clear existing content
    masterSheet.clear();
    
    // Collect data from all team sheets
    const allTeamsData = collectAllTeamsData();
    
    // Build dashboard
    buildDashboard(masterSheet, allTeamsData);
    
    // Show completion message
    SpreadsheetApp.getUi().alert('Master Tracker Dashboard created successfully!');
    
  } catch (error) {
    console.error('Error creating master tracker:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Collects data from all team sheets
 */
function collectAllTeamsData() {
  const allData = {
    teams: [],
    overallStats: {
      totalTasks: 0,
      completed: 0,
      inProgress: 0,
      review: 0,
      notStarted: 0,
      issues: 0
    }
  };
  
  // Process each week
  Object.entries(CONFIG.TEAM_WEEKS).forEach(([weekKey, teams]) => {
    teams.forEach(team => {
      if (team.id) {
        try {
          const teamData = getTeamData(team);
          allData.teams.push(teamData);
          
          // Update overall stats
          allData.overallStats.totalTasks += teamData.stats.total;
          allData.overallStats.completed += teamData.stats.completed;
          allData.overallStats.inProgress += teamData.stats.inProgress;
          allData.overallStats.review += teamData.stats.review;
          allData.overallStats.notStarted += teamData.stats.notStarted;
          allData.overallStats.issues += teamData.stats.issues;
          
        } catch (error) {
          console.error(`Error processing team ${team.name}:`, error);
        }
      }
    });
  });
  
  return allData;
}

/**
 * Gets data from a single team sheet
 */
function getTeamData(teamConfig) {
  const sheet = SpreadsheetApp.openById(teamConfig.id).getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    return {
      config: teamConfig,
      stats: {
        total: 0,
        completed: 0,
        inProgress: 0,
        review: 0,
        notStarted: 0,
        issues: 0
      },
      tasks: []
    };
  }
  
  // Find column indices
  const headers = data[0];
  const statusCol = headers.findIndex(h => h.toString().toLowerCase() === CONFIG.STATUS_COLUMN.toLowerCase());
  const serialCol = headers.findIndex(h => h.toString().toLowerCase() === CONFIG.SERIAL_COLUMN.toLowerCase());
  const repoCol = headers.findIndex(h => h.toString().toLowerCase() === CONFIG.REPO_COLUMN.toLowerCase());
  
  // Process tasks
  const tasks = [];
  const stats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    review: 0,
    notStarted: 0,
    issues: 0
  };
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[serialCol] || row[repoCol]) { // Check if row has data
      const status = row[statusCol] ? row[statusCol].toString() : '';
      const statusCategory = categorizeStatus(status);
      
      tasks.push({
        serial: row[serialCol] || '',
        repo: row[repoCol] || '',
        status: status,
        category: statusCategory
      });
      
      stats.total++;
      stats[statusCategory]++;
    }
  }
  
  return {
    config: teamConfig,
    stats: stats,
    tasks: tasks
  };
}

/**
 * Categorizes status based on CONFIG.STATUS_VALUES
 */
function categorizeStatus(status) {
  const normalizedStatus = status.toString().toLowerCase().trim();
  
  for (const [category, values] of Object.entries(CONFIG.STATUS_VALUES)) {
    if (values.some(v => v.toLowerCase() === normalizedStatus)) {
      switch(category) {
        case 'NOT_STARTED': return 'notStarted';
        case 'IN_PROGRESS': return 'inProgress';
        case 'REVIEW': return 'review';
        case 'COMPLETED': return 'completed';
        case 'ISSUES': return 'issues';
      }
    }
  }
  
  return 'notStarted'; // Default category
}

/**
 * Builds the dashboard layout
 */
function buildDashboard(sheet, data) {
  let currentRow = 1;
  
  // 1. Dashboard Header
  currentRow = createDashboardHeader(sheet, currentRow);
  
  // 2. Overall Progress Section
  currentRow = createOverallProgress(sheet, data.overallStats, currentRow);
  
  // 3. Team Statistics Table
  currentRow = createTeamStatisticsTable(sheet, data.teams, currentRow);
  
  // 4. Progress Charts (using data bars)
  currentRow = createProgressCharts(sheet, data, currentRow);
  
  // 5. Detailed Status Breakdown
  currentRow = createStatusBreakdown(sheet, data.teams, currentRow);
  
  // Format the entire sheet
  formatDashboard(sheet);
}

/**
 * Creates dashboard header
 */
function createDashboardHeader(sheet, startRow) {
  sheet.getRange(startRow, 1, 1, 10).merge();
  const headerCell = sheet.getRange(startRow, 1);
  headerCell.setValue('PROJECT MASTER TRACKER DASHBOARD');
  headerCell.setFontSize(20);
  headerCell.setFontWeight('bold');
  headerCell.setBackground(CONFIG.COLORS.HEADER);
  headerCell.setFontColor('#ffffff');
  headerCell.setHorizontalAlignment('center');
  headerCell.setVerticalAlignment('middle');
  sheet.setRowHeight(startRow, 50);
  
  // Last updated timestamp
  sheet.getRange(startRow + 1, 1, 1, 10).merge();
  const timestampCell = sheet.getRange(startRow + 1, 1);
  timestampCell.setValue('Last Updated: ' + new Date().toLocaleString());
  timestampCell.setFontStyle('italic');
  timestampCell.setHorizontalAlignment('center');
  
  return startRow + 3;
}

/**
 * Creates overall progress section
 */
function createOverallProgress(sheet, stats, startRow) {
  // Section header
  sheet.getRange(startRow, 1, 1, 10).merge();
  const sectionHeader = sheet.getRange(startRow, 1);
  sectionHeader.setValue('OVERALL PROJECT PROGRESS');
  sectionHeader.setFontSize(16);
  sectionHeader.setFontWeight('bold');
  sectionHeader.setBackground(CONFIG.COLORS.LIGHT_GRAY);
  
  // Progress metrics
  const progressRow = startRow + 2;
  const completionPercentage = (stats.completed / CONFIG.PROJECT_TARGET * 100).toFixed(1);
  const progressPercentage = ((stats.completed + stats.inProgress + stats.review) / CONFIG.PROJECT_TARGET * 100).toFixed(1);
  
  // Create progress cards
  const cards = [
    {
      label: 'Project Target',
      value: CONFIG.PROJECT_TARGET.toLocaleString(),
      color: CONFIG.COLORS.HEADER
    },
    {
      label: 'Total Tasks',
      value: stats.totalTasks.toLocaleString(),
      color: CONFIG.COLORS.HEADER
    },
    {
      label: 'Completed',
      value: `${stats.completed.toLocaleString()} (${completionPercentage}%)`,
      color: CONFIG.COLORS.COMPLETED
    },
    {
      label: 'In Progress',
      value: stats.inProgress.toLocaleString(),
      color: CONFIG.COLORS.IN_PROGRESS
    },
    {
      label: 'In Review',
      value: stats.review.toLocaleString(),
      color: CONFIG.COLORS.REVIEW
    }
  ];
  
  cards.forEach((card, index) => {
    const col = (index * 2) + 1;
    
    // Label
    sheet.getRange(progressRow, col).setValue(card.label);
    sheet.getRange(progressRow, col).setFontWeight('bold');
    
    // Value
    sheet.getRange(progressRow + 1, col).setValue(card.value);
    sheet.getRange(progressRow + 1, col).setFontSize(14);
    sheet.getRange(progressRow + 1, col).setFontColor(card.color);
    sheet.getRange(progressRow + 1, col).setFontWeight('bold');
  });
  
  // Progress bar
  const progressBarRow = progressRow + 3;
  sheet.getRange(progressBarRow, 1).setValue('Overall Completion:');
  sheet.getRange(progressBarRow, 1).setFontWeight('bold');
  
  sheet.getRange(progressBarRow, 2, 1, 8).merge();
  createProgressBar(sheet, progressBarRow, 2, parseFloat(completionPercentage));
  
  return progressBarRow + 3;
}

/**
 * Creates team statistics table
 */
function createTeamStatisticsTable(sheet, teams, startRow) {
  // Section header
  sheet.getRange(startRow, 1, 1, 10).merge();
  const sectionHeader = sheet.getRange(startRow, 1);
  sectionHeader.setValue('TEAM STATISTICS');
  sectionHeader.setFontSize(16);
  sectionHeader.setFontWeight('bold');
  sectionHeader.setBackground(CONFIG.COLORS.LIGHT_GRAY);
  
  // Table headers
  const headerRow = startRow + 2;
  const headers = [
    'Team Name', 'Lead', 'Week', 'Developers', 'Capacity',
    'Total Tasks', 'Completed', 'In Progress', 'Review', 'Issues', 'Progress %', 'Sheet Link'
  ];
  
  headers.forEach((header, index) => {
    const cell = sheet.getRange(headerRow, index + 1);
    cell.setValue(header);
    cell.setFontWeight('bold');
    cell.setBackground(CONFIG.COLORS.HEADER);
    cell.setFontColor('#ffffff');
    cell.setBorder(true, true, true, true, false, false);
  });
  
  // Team data rows
  let dataRow = headerRow + 1;
  teams.forEach(team => {
    const progressPercentage = team.stats.total > 0 
      ? (team.stats.completed / team.stats.total * 100).toFixed(1)
      : 0;
    
    const rowData = [
      team.config.name,
      team.config.leadName,
      `Week ${team.config.weekNumber}`,
      team.config.developers,
      team.config.weeklyCapacity,
      team.stats.total,
      team.stats.completed,
      team.stats.inProgress,
      team.stats.review,
      team.stats.issues,
      `${progressPercentage}%`,
      `=HYPERLINK("https://docs.google.com/spreadsheets/d/${team.config.id}", "Open Sheet")`
    ];
    
    rowData.forEach((value, index) => {
      const cell = sheet.getRange(dataRow, index + 1);
      cell.setValue(value);
      
      // Style specific columns
      if (index === 6) { // Completed column
        cell.setFontColor(CONFIG.COLORS.COMPLETED);
        cell.setFontWeight('bold');
      } else if (index === 9) { // Issues column
        if (value > 0) {
          cell.setFontColor(CONFIG.COLORS.ISSUES);
          cell.setFontWeight('bold');
        }
      } else if (index === 10) { // Progress column
        const progress = parseFloat(value);
        if (progress >= 80) {
          cell.setFontColor(CONFIG.COLORS.COMPLETED);
        } else if (progress >= 50) {
          cell.setFontColor(CONFIG.COLORS.IN_PROGRESS);
        } else {
          cell.setFontColor(CONFIG.COLORS.ISSUES);
        }
        cell.setFontWeight('bold');
      }
      
      cell.setBorder(true, true, true, true, false, false);
    });
    
    // Alternate row coloring
    if (dataRow % 2 === 0) {
      sheet.getRange(dataRow, 1, 1, headers.length).setBackground(CONFIG.COLORS.LIGHT_GRAY);
    }
    
    dataRow++;
  });
  
  return dataRow + 2;
}

/**
 * Creates progress charts using data bars
 */
function createProgressCharts(sheet, data, startRow) {
  // Section header
  sheet.getRange(startRow, 1, 1, 10).merge();
  const sectionHeader = sheet.getRange(startRow, 1);
  sectionHeader.setValue('TEAM PROGRESS VISUALIZATION');
  sectionHeader.setFontSize(16);
  sectionHeader.setFontWeight('bold');
  sectionHeader.setBackground(CONFIG.COLORS.LIGHT_GRAY);
  
  let chartRow = startRow + 2;
  
  // Create progress bar for each team
  data.teams.forEach(team => {
    const progressPercentage = team.stats.total > 0 
      ? (team.stats.completed / team.stats.total * 100)
      : 0;
    
    // Team name
    sheet.getRange(chartRow, 1, 1, 2).merge();
    const nameCell = sheet.getRange(chartRow, 1);
    nameCell.setValue(team.config.name);
    nameCell.setFontWeight('bold');
    
    // Progress bar
    sheet.getRange(chartRow, 3, 1, 6).merge();
    createProgressBar(sheet, chartRow, 3, progressPercentage);
    
    // Percentage label
    sheet.getRange(chartRow, 9).setValue(`${progressPercentage.toFixed(1)}%`);
    sheet.getRange(chartRow, 9).setFontWeight('bold');
    
    // Tasks count
    sheet.getRange(chartRow, 10).setValue(`${team.stats.completed}/${team.stats.total}`);
    
    chartRow++;
  });
  
  return chartRow + 2;
}

/**
 * Creates detailed status breakdown
 */
function createStatusBreakdown(sheet, teams, startRow) {
  // Section header
  sheet.getRange(startRow, 1, 1, 10).merge();
  const sectionHeader = sheet.getRange(startRow, 1);
  sectionHeader.setValue('STATUS BREAKDOWN BY TEAM');
  sectionHeader.setFontSize(16);
  sectionHeader.setFontWeight('bold');
  sectionHeader.setBackground(CONFIG.COLORS.LIGHT_GRAY);
  
  // Create breakdown for each team
  let breakdownRow = startRow + 2;
  
  teams.forEach(team => {
    // Team header
    sheet.getRange(breakdownRow, 1, 1, 10).merge();
    const teamHeader = sheet.getRange(breakdownRow, 1);
    teamHeader.setValue(`${team.config.name} - Lead: ${team.config.leadName}`);
    teamHeader.setFontWeight('bold');
    teamHeader.setBackground('#e8eaf6');
    
    breakdownRow++;
    
    // Status counts
    const statuses = [
      { name: 'Not Started', count: team.stats.notStarted, color: CONFIG.COLORS.NOT_STARTED },
      { name: 'In Progress', count: team.stats.inProgress, color: CONFIG.COLORS.IN_PROGRESS },
      { name: 'In Review', count: team.stats.review, color: CONFIG.COLORS.REVIEW },
      { name: 'Completed', count: team.stats.completed, color: CONFIG.COLORS.COMPLETED },
      { name: 'Issues', count: team.stats.issues, color: CONFIG.COLORS.ISSUES }
    ];
    
    statuses.forEach((status, index) => {
      const col = (index * 2) + 1;
      sheet.getRange(breakdownRow, col).setValue(status.name);
      sheet.getRange(breakdownRow, col).setFontSize(10);
      
      const countCell = sheet.getRange(breakdownRow, col + 1);
      countCell.setValue(status.count);
      countCell.setFontWeight('bold');
      countCell.setFontColor(status.color);
      countCell.setHorizontalAlignment('center');
    });
    
    breakdownRow += 2;
  });
  
  return breakdownRow;
}

/**
 * Creates a progress bar in a cell
 */
function createProgressBar(sheet, row, col, percentage) {
  const cell = sheet.getRange(row, col);
  const barLength = 50; // Number of characters for the bar
  const filledLength = Math.round(barLength * percentage / 100);
  const emptyLength = barLength - filledLength;
  
  const filledChar = '█';
  const emptyChar = '░';
  
  const progressBar = filledChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
  const progressText = ` ${percentage.toFixed(1)}%`;
  
  cell.setValue(progressBar + progressText);
  cell.setFontFamily('Consolas');
  
  // Color based on percentage
  if (percentage >= 80) {
    cell.setFontColor(CONFIG.COLORS.COMPLETED);
  } else if (percentage >= 50) {
    cell.setFontColor(CONFIG.COLORS.IN_PROGRESS);
  } else if (percentage >= 25) {
    cell.setFontColor(CONFIG.COLORS.REVIEW);
  } else {
    cell.setFontColor(CONFIG.COLORS.ISSUES);
  }
}

/**
 * Formats the entire dashboard
 */
function formatDashboard(sheet) {
  // Auto-resize columns
  sheet.autoResizeColumns(1, 12);
  
  // Set minimum column widths
  sheet.setColumnWidth(1, 200); // Team name column
  sheet.setColumnWidth(2, 120); // Lead column
  
  // Add borders to the entire data range
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, false, false, CONFIG.COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  
  // Center align numeric columns
  for (let col = 3; col <= 11; col++) {
    sheet.getRange(1, col, sheet.getMaxRows()).setHorizontalAlignment('center');
  }
  
  // Freeze header rows
  sheet.setFrozenRows(3);
}

// ============================
// MENU AND TRIGGERS
// ============================

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Master Tracker')
    .addItem('Create/Update Dashboard', 'createMasterTracker')
    .addItem('Configure Team Sheets', 'showConfigurationDialog')
    .addSeparator()
    .addItem('Schedule Auto-Update', 'scheduleAutoUpdate')
    .addItem('Remove Auto-Update', 'removeAutoUpdate')
    .addToUi();
}

/**
 * Shows configuration dialog
 */
function showConfigurationDialog() {
  const html = HtmlService.createHtmlOutputFromFile('ConfigDialog')
    .setWidth(600)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configure Team Sheets');
}

/**
 * Schedules automatic updates
 */
function scheduleAutoUpdate() {
  // Remove existing triggers
  removeAutoUpdate();
  
  // Create new trigger for every hour
  ScriptApp.newTrigger('createMasterTracker')
    .timeBased()
    .everyHours(1)
    .create();
  
  SpreadsheetApp.getUi().alert('Auto-update scheduled! The dashboard will refresh every hour.');
}

/**
 * Removes automatic update trigger
 */
function removeAutoUpdate() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'createMasterTracker') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

// ============================
// HELPER FUNCTIONS
// ============================

/**
 * Gets configuration for use in HTML dialog
 */
function getConfiguration() {
  return CONFIG;
}

/**
 * Updates configuration from HTML dialog
 */
function updateConfiguration(newConfig) {
  // This would typically save to Script Properties
  // For now, you'll need to update the CONFIG object manually
  console.log('Configuration update requested:', newConfig);
  SpreadsheetApp.getUi().alert('Configuration saved! Please update the CONFIG object in the script.');
}