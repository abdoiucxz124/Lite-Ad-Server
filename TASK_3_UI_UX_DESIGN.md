# TASK 3: ADVANCED UI/UX DESIGN SYSTEM - DIRECT CODEX PROMPT

**COPY THIS ENTIRE PROMPT TO CODEX:**

---

Building on Tasks 1-2 (admin dashboard + ad formats), I need you to create a comprehensive design system and enhance the user experience with modern, intuitive interfaces that prioritize usability, accessibility, and efficiency.

**Current State After Tasks 1-2:**
- Enhanced database with campaigns, creatives, and ad formats
- Modern admin dashboard with campaign management
- Multiple ad format rendering engines (PushDown, Interscroller, etc.)
- WebSocket real-time updates

**Objective:** Create a comprehensive design system and user experience framework with modern UI components, accessibility compliance, and mobile-first design.

**Requirements:**

1. **Modern CSS Design System** - Create `src/public/design-system.css`:
```css
/* CSS Custom Properties Design System */
:root {
  /* Color Palette */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-900: #1e3a8a;
  
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
  
  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

/* Component Library */

/* Button Components */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.btn-primary:hover {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

.btn-secondary {
  background-color: white;
  color: var(--gray-900);
  border-color: var(--gray-300);
}

.btn-ghost {
  background-color: transparent;
  color: var(--gray-700);
}

.btn-success {
  background-color: var(--success-500);
  color: white;
}

.btn-warning {
  background-color: var(--warning-500);
  color: white;
}

.btn-error {
  background-color: var(--error-500);
  color: white;
}

/* Form Components */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card Components */
.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

/* Navigation Components */
.nav-tabs {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: var(--space-6);
}

.nav-tab {
  padding: var(--space-3) var(--space-4);
  color: var(--gray-500);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.nav-tab:hover {
  color: var(--gray-700);
}

.nav-tab.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
}

/* Table Components */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.table th {
  background-color: var(--gray-50);
  font-weight: var(--font-medium);
  color: var(--gray-900);
}

/* Modal Components */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

/* Alert Components */
.alert {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.alert-success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-warning {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Grid System */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive Design */
@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr;
  }
  
  .btn {
    width: 100%;
  }
  
  .modal-content {
    margin: var(--space-4);
    width: calc(100% - 2rem);
  }
}
```

2. **Enhanced Dashboard Layout** - Update `src/public/admin.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lite Ad Server - Admin Dashboard</title>
  <link rel="stylesheet" href="design-system.css">
  <style>
    /* Dashboard-specific styles */
    .dashboard-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }
    
    .sidebar {
      background: var(--gray-900);
      color: white;
      padding: var(--space-6);
    }
    
    .main-content {
      padding: var(--space-6);
      background: var(--gray-50);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }
    
    .stat-card {
      background: white;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    
    .stat-value {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      color: var(--primary-600);
    }
    
    .stat-label {
      color: var(--gray-600);
      margin-top: var(--space-2);
    }
    
    @media (max-width: 768px) {
      .dashboard-layout {
        grid-template-columns: 1fr;
      }
      
      .sidebar {
        order: 2;
      }
    }
  </style>
</head>
<body>
  <div class="dashboard-layout">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <h2>Lite Ad Server</h2>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3>Campaign Management</h3>
          <ul>
            <li><a href="#dashboard" class="nav-link">Dashboard</a></li>
            <li><a href="#campaigns" class="nav-link">All Campaigns</a></li>
            <li><a href="#creatives" class="nav-link">Creative Studio</a></li>
            <li><a href="#formats" class="nav-link">Ad Formats</a></li>
          </ul>
        </div>
        
        <div class="nav-section">
          <h3>Analytics & Reports</h3>
          <ul>
            <li><a href="#analytics" class="nav-link">Analytics</a></li>
            <li><a href="#performance" class="nav-link">Performance</a></li>
            <li><a href="#revenue" class="nav-link">Revenue</a></li>
          </ul>
        </div>
        
        <div class="nav-section">
          <h3>Settings</h3>
          <ul>
            <li><a href="#integration" class="nav-link">Integration</a></li>
            <li><a href="#settings" class="nav-link">Settings</a></li>
          </ul>
        </div>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="content-header">
        <div class="breadcrumb">Dashboard</div>
        <div class="header-actions">
          <button class="btn btn-primary">+ Create Campaign</button>
        </div>
      </header>
      
      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">$2,543</div>
          <div class="stat-label">Revenue Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">12,345</div>
          <div class="stat-label">Impressions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">2.3%</div>
          <div class="stat-label">Click Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">8</div>
          <div class="stat-label">Active Campaigns</div>
        </div>
      </div>
      
      <!-- Tab Navigation -->
      <div class="nav-tabs">
        <a href="#dashboard" class="nav-tab active">Dashboard</a>
        <a href="#campaigns" class="nav-tab">Campaigns</a>
        <a href="#analytics" class="nav-tab">Analytics</a>
        <a href="#settings" class="nav-tab">Settings</a>
      </div>
      
      <!-- Content Area -->
      <div class="content-body">
        <!-- Dynamic content will be loaded here -->
      </div>
    </main>
  </div>
  
  <!-- Include existing scripts -->
  <script src="/socket.io/socket.io.js"></script>
  <script>
    // Enhanced UI functionality
    class UIManager {
      constructor() {
        this.initializeNavigation();
        this.initializeModals();
        this.initializeTooltips();
      }
      
      initializeNavigation() {
        // Tab switching functionality
        document.querySelectorAll('.nav-tab').forEach(tab => {
          tab.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab(tab.getAttribute('href').substring(1));
          });
        });
      }
      
      switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
          tab.classList.remove('active');
        });
        document.querySelector(`[href="#${tabName}"]`).classList.add('active');
        
        // Load tab content
        this.loadTabContent(tabName);
      }
      
      loadTabContent(tabName) {
        // Load content via AJAX or show/hide sections
      }
      
      showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 5000);
      }
      
      openModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal-content">
            ${content}
          </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
      }
    }
    
    // Initialize UI Manager
    const ui = new UIManager();
    
    // WebSocket integration for real-time updates
    const socket = io();
    socket.on('connect', () => {
      console.log('Connected to server');
      ui.showNotification('Connected to server', 'success');
    });
    
    socket.on('analytics-update', (data) => {
      // Update dashboard stats in real-time
    });
  </script>
</body>
</html>
```

3. **Campaign Creation Wizard** - Implement step-by-step workflow:
```javascript
// In admin.html or separate file
class CampaignWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.campaignData = {};
  }
  
  showWizard() {
    const wizardHTML = `
      <div class="campaign-wizard">
        <div class="wizard-header">
          <h2>Create New Campaign</h2>
          <div class="wizard-progress">
            <div class="progress-bar" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
          </div>
        </div>
        
        <div class="wizard-content">
          ${this.getStepContent()}
        </div>
        
        <div class="wizard-footer">
          <button class="btn btn-secondary" onclick="wizard.previousStep()" ${this.currentStep === 1 ? 'disabled' : ''}>
            Previous
          </button>
          <button class="btn btn-primary" onclick="wizard.nextStep()">
            ${this.currentStep === this.totalSteps ? 'Create Campaign' : 'Next'}
          </button>
        </div>
      </div>
    `;
    
    ui.openModal(wizardHTML);
  }
  
  getStepContent() {
    switch(this.currentStep) {
      case 1: return this.getBasicInfoStep();
      case 2: return this.getFormatSelectionStep();
      case 3: return this.getTargetingStep();
      case 4: return this.getReviewStep();
    }
  }
  
  getBasicInfoStep() {
    return `
      <div class="wizard-step">
        <h3>Campaign Basic Information</h3>
        <div class="form-group">
          <label class="form-label">Campaign Name</label>
          <input type="text" class="form-input" id="campaignName" placeholder="Enter campaign name">
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="campaignDescription" placeholder="Campaign description"></textarea>
        </div>
      </div>
    `;
  }
  
  getFormatSelectionStep() {
    return `
      <div class="wizard-step">
        <h3>Select Ad Format</h3>
        <div class="format-grid">
          <div class="format-card" data-format="banner">
            <h4>Banner Ad</h4>
            <p>Standard rectangular advertisements</p>
          </div>
          <div class="format-card" data-format="pushdown">
            <h4>PushDown Banner</h4>
            <p>Expandable banner that pushes content down</p>
          </div>
          <div class="format-card" data-format="interscroller">
            <h4>Interscroller</h4>
            <p>Full-screen ads between content sections</p>
          </div>
          <!-- More formats... -->
        </div>
      </div>
    `;
  }
}
```

4. **Accessibility Features:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility  
- High contrast mode support
- Reduced motion preferences

5. **Mobile-First Responsive Design:**
- Touch-friendly interface elements
- Swipe gestures for mobile navigation
- Optimized for various screen sizes
- Progressive enhancement

**Quality Requirements:**
- WCAG 2.1 AA accessibility compliance
- Mobile-responsive design (320px to 1920px)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Performance optimization (CSS < 50KB compressed)
- Modern CSS with fallbacks for older browsers

**Testing Requirements:**
- Test on multiple devices and screen sizes
- Accessibility testing with screen readers
- Performance testing (load times, animations)
- Cross-browser compatibility testing

Please implement this comprehensive design system with modern UI components, accessibility features, and mobile-first responsive design while maintaining integration with the existing WebSocket system and admin functionality. 