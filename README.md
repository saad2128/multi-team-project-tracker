# Master Tracker Dashboard 📊

A powerful Google Apps Script-based dashboard solution for tracking and managing large-scale multi-team projects. Designed to handle 5000+ tasks across multiple teams with real-time progress visualization and automated reporting.

## 🎯 Features

- **📈 Real-time Progress Tracking**: Automatically aggregates data from multiple team sheets
- **👥 Multi-team Support**: Track unlimited teams across multiple weeks
- **🎨 Visual Dashboard**: Color-coded status indicators and progress bars
- **🔗 Direct Navigation**: One-click access to individual team sheets
- **📊 Comprehensive Analytics**: Team-wise and overall project statistics
- **🔄 Auto-refresh**: Configurable automatic updates (hourly/daily)
- **🏷️ Smart Categorization**: Automatic status classification (Not Started, In Progress, Review, Completed, Issues)
- **📱 Responsive Design**: Optimized for various screen sizes

## 🚀 Quick Start

### Prerequisites

- Google Account with access to Google Sheets
- Basic knowledge of Google Apps Script
- Team sheets with required column structure

### Installation

1. **Create a new Google Sheet** for your master dashboard
   
2. **Open Script Editor**
   - Go to `Extensions` → `Apps Script`
   
3. **Copy the Code**
   - Delete any existing code in the script editor
   - Copy and paste the entire `Code.gs` content
   
4. **Create HTML File**
   - Click `+` next to Files → `HTML`
   - Name it `ConfigDialog`
   - Copy and paste the HTML content
   
5. **Save and Refresh**
   - Save the project (Ctrl+S or Cmd+S)
   - Refresh your Google Sheet
   - You should see a new "Master Tracker" menu

## 📋 Configuration

### Team Sheet Structure

Each team sheet must have the following columns:

| Column Name | Description | Required |
|------------|-------------|----------|
| `sr_no` | Serial number | Yes |
| `repo_name` | Repository/Task name | Yes |
| `status` | Current task status | Yes |

### Status Values

The dashboard recognizes these status values:

- **Not Started**: `Not Started`, `TODO`, `Backlog`, `Pending`, `New`
- **In Progress**: `In-Progress`, `Working`, `Started`, `Assigned`, `Development`
- **Review**: `Ready for Review`, `In-Review`, `Review`, `Under Review`
- **Completed**: `Completed`, `Done`, `Finished`, `Closed`, `Deployed`
- **Issues**: `In-Complete Data`, `Data Issues`, `Missing Data`

### Setting Up Team Sheets

1. Click `Master Tracker` → `Configure Team Sheets`
2. For each team, enter:
   - Google Sheet ID (found in the sheet URL between `/d/` and `/edit`)
   - Verify team details (name, lead, capacity)
3. Click "Save Configuration"

## 🎮 Usage

### Creating the Dashboard

1. Click `Master Tracker` → `Create/Update Dashboard`
2. Wait for the process to complete (may take 10-30 seconds)
3. The dashboard will be created in a new sheet called "Master Tracker Dashboard"

### Dashboard Sections

1. **Overall Project Progress**
   - Total tasks vs. target (5000)
   - Completion percentage
   - Status breakdown

2. **Team Statistics Table**
   - Individual team performance
   - Task counts by status
   - Direct links to team sheets

3. **Progress Visualization**
   - Visual progress bars for each team
   - Color-coded completion rates

4. **Status Breakdown**
   - Detailed status counts per team
   - Issues tracking

### Automatic Updates

Enable automatic refresh:
```
Master Tracker → Schedule Auto-Update
```

Remove automatic updates:
```
Master Tracker → Remove Auto-Update
```

## 🛠️ Customization

### Modifying Configuration

Edit the `CONFIG` object in the script:

```javascript
const CONFIG = {
  PROJECT_TARGET: 5000,  // Change project target
  MASTER_SHEET_NAME: 'Master Tracker Dashboard',
  
  // Add more teams
  TEAM_WEEKS: {
    week_1: [...],
    week_2: [
      {
        id: 'SHEET_ID_HERE',
        name: 'Team 5 - Phoenix (Week 2)',
        leadName: 'John Doe',
        developers: 7,
        weeklyCapacity: 175,
        weekNumber: 2
      }
    ]
  }
};
```
