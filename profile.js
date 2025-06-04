// Function to set the theme
function setTheme(theme) {
    console.log('Setting theme to:', theme);
    const body = document.body;
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Function to load the saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    console.log('Loaded theme preference:', savedTheme);
    if (savedTheme) {
        setTheme(savedTheme);
        // Update the toggle switch state based on the loaded theme
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = savedTheme === 'dark';
            console.log('Toggle state set based on preference');
        } else {
             console.log('Toggle not found on load, waiting for DOMContentLoaded');
             document.addEventListener('DOMContentLoaded', () => {
                 const toggleAfterLoad = document.getElementById('darkModeToggle');
                  if (toggleAfterLoad) {
                      toggleAfterLoad.checked = savedTheme === 'dark';
                      console.log('Toggle state set after DOMContentLoaded');
                  }
             });
         }
    } else {
        console.log('No theme preference saved.');
        // Default theme (optional, could be light or check system preference)
        // setTheme('light');
    }
}

// Function to handle the theme toggle
function handleThemeToggle() {
     const darkModeToggle = document.getElementById('darkModeToggle');
     if (darkModeToggle) {
         console.log('Toggle found, adding event listener');
         darkModeToggle.addEventListener('change', function() {
             console.log('Toggle changed, checked:', this.checked);
             if (this.checked) {
                 setTheme('dark');
                 localStorage.setItem('theme', 'dark');
             } else {
                 setTheme('light');
                 localStorage.setItem('theme', 'light');
             }
         });
     } else {
         console.log('Toggle not found initially, waiting for DOMContentLoaded to add listener');
         // If toggle not found initially, wait for it
         document.addEventListener('DOMContentLoaded', () => {
             const toggleAfterLoad = document.getElementById('darkModeToggle');
              if (toggleAfterLoad) {
                  console.log('Toggle found after DOMContentLoaded, adding event listener');
                  toggleAfterLoad.addEventListener('change', function() {
                      console.log('Toggle changed (after load), checked:', this.checked);
                      if (this.checked) {
                          setTheme('dark');
                          localStorage.setItem('theme', 'dark');
                      } else {
                          setTheme('light');
                          localStorage.setItem('theme', 'light');
                      }
                  });
              }
         });
     }
 }

 // Load theme preference and set up toggle listener when the page loads
 console.log('Script profile.js started');
 loadThemePreference();
 handleThemeToggle();

 // Optional: Listen for system theme changes (modern browsers)
 if (window.matchMedia) {
     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
         console.log('System theme preference changed', event.matches ? 'dark' : 'light');
         // Only apply if no explicit theme preference is saved
         if (!localStorage.getItem('theme')) {
             setTheme(event.matches ? 'dark' : 'light');
             // You might want to update the toggle state here too if it exists
             const darkModeToggle = document.getElementById('darkModeToggle');
              if (darkModeToggle) {
                  toggleAfterLoad.checked = event.matches;
                  console.log('Toggle state updated based on system preference');
              }
         }
     });
 } 