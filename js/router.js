// Client-side router for BaseTask
// Handles all navigation without relying on Vercel routing

class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    
    // Listen for navigation events
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Intercept all link clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        this.navigate(route);
      }
    });
  }

  // Register a route
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate to a route
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  // Handle current route
  async handleRoute() {
    const path = window.location.pathname;
    const route = this.routes[path] || this.routes['/'];
    
    if (route) {
      this.currentPage = path;
      await route();
    } else {
      // Fallback to home
      this.navigate('/');
    }
  }

  // Load HTML content into main container
  async loadPage(pageName) {
    try {
      const response = await fetch(`pages/${pageName}.html`);
      if (!response.ok) throw new Error(`Failed to load ${pageName}`);
      
      const html = await response.text();
      
      // Extract body content (remove html, head, body tags)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('main') || doc.body;
      
      // Replace main content
      const mainContainer = document.getElementById('app');
      if (mainContainer) {
        mainContainer.innerHTML = content.innerHTML;
        
        // Execute any scripts in the loaded content
        this.executeScripts(content);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      document.getElementById('app').innerHTML = `
        <div class="container mt-3 text-center">
          <div class="card">
            <h2>Page Not Found</h2>
            <p class="text-secondary">The page you're looking for doesn't exist.</p>
            <button onclick="router.navigate('/')" class="btn btn-primary mt-2">Go Home</button>
          </div>
        </div>
      `;
    }
  }

  // Execute scripts from loaded content
  executeScripts(content) {
    const scripts = content.querySelectorAll('script');
    scripts.forEach(script => {
      if (!script.src) {
        // Inline script
        eval(script.textContent);
      }
    });
  }
}

// Create global router instance
const router = new Router();

// Define all routes
router.addRoute('/', async () => {
  await router.loadPage('index');
  // Run index page specific code
  initHomePage();
});

router.addRoute('/dashboard', async () => {
  if (!isWalletConnected()) {
    router.navigate('/');
    showAlert('Please connect your wallet first', 'error');
    return;
  }
  await router.loadPage('dashboard');
  checkConnection();
});

router.addRoute('/create-task', async () => {
  if (!isWalletConnected()) {
    router.navigate('/');
    showAlert('Please connect your wallet first', 'error');
    return;
  }
  await router.loadPage('create-task');
  initCreateTaskPage();
});

router.addRoute('/tasks', async () => {
  await router.loadPage('tasks');
  loadTasks();
});

router.addRoute('/submissions', async () => {
  if (!isWalletConnected()) {
    router.navigate('/');
    showAlert('Please connect your wallet first', 'error');
    return;
  }
  await router.loadPage('submissions');
  checkAndLoadData();
});

// Helper: Navigate programmatically
function navigateTo(path) {
  router.navigate(path);
}

// Initialize router on page load
document.addEventListener('DOMContentLoaded', () => {
  router.handleRoute();
});
