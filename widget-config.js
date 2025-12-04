// Widget Configuration for iOS Lockscreen Widget
const WIDGET_CONFIG = {
  // Refresh interval (15 minutes = 900 seconds)
  refreshInterval: 900,

  // Widget size configurations
  sizes: {
    small: {
      taskLimit: 3,
      showTime: true,
      showProgress: false,
      showCheckboxes: false,
      width: 155,
      height: 155
    },
    medium: {
      taskLimit: 6,
      showTime: true,
      showProgress: true,
      showCheckboxes: true,
      width: 329,
      height: 155
    },
    large: {
      taskLimit: 12,
      showTime: true,
      showProgress: true,
      showCheckboxes: true,
      width: 329,
      height: 345
    }
  },

  // Color scheme matching website
  colors: {
    background: '#0f172a',
    primary: '#2563eb',
    secondary: '#1e40af',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#64748b'
    },
    border: '#1e293b'
  },

  // Typography
  typography: {
    small: {
      title: 12,
      task: 10,
      time: 8
    },
    medium: {
      title: 14,
      task: 12,
      time: 10
    },
    large: {
      title: 16,
      task: 14,
      time: 12
    }
  },

  // Widget display options
  display: {
    showCompleted: false,
    showGroupIndicator: true,
    showNextTaskTime: true,
    showProgressBar: true,
    compactMode: false
  },

  // Data update settings
  dataUpdate: {
    onTaskComplete: true,
    onTaskAdd: true,
    onGroupChange: true,
    onWakeAlarm: true
  },

  // Icon mappings
  icons: {
    wake: '⏰',
    group1: '1️⃣',
    group2: '2️⃣',
    group3: '3️⃣',
    sunday: '📅',
    wednesday: '📅',
    completed: '✅',
    pending: '⚪',
    inProgress: '🔵'
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WIDGET_CONFIG;
}
