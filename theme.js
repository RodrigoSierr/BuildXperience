// theme.js - Lógica centralizada para el modo oscuro

/**
 * Aplica la clase 'dark-mode' al body (o al elemento html para mayor robustez)
 * si está activado en localStorage.
 */
function applyTheme() {
    const isDarkMode = localStorage.getItem('darkModeEnabled') === 'true';
    // Aplicar la clase al elemento <html> es a menudo más robusto
    // y permite que el script en <head> funcione sobre el mismo elemento.
    document.documentElement.classList.toggle('dark-mode', isDarkMode);

    // También puedes mantenerlo en el body si prefieres y tu CSS está configurado para ello:
    // document.body.classList.toggle('dark-mode', isDarkMode);
}

/**
 * Sincroniza el estado de cualquier interruptor de modo oscuro en la página
 * con la preferencia guardada en localStorage.
 */
function syncThemeToggles() {
    const isDarkMode = localStorage.getItem('darkModeEnabled') === 'true';
    document.querySelectorAll('.dark-mode-toggle-switch').forEach(toggle => {
        if (toggle.type === 'checkbox') {
            toggle.checked = isDarkMode;
        }
    });
}

/**
 * Maneja el evento de cambio en cualquier interruptor de modo oscuro.
 * Guarda la preferencia y aplica el tema.
 */
function handleThemeToggle(event) {
    if (event.target.type === 'checkbox') {
        const isChecked = event.target.checked;
        localStorage.setItem('darkModeEnabled', isChecked);
        applyTheme();
        // Sincroniza otros toggles si llegara a haber más en la misma página
        syncThemeToggles(); 
    }
}

// --- Inicialización ---

// 1. Aplica el tema tan pronto como el script se carga.
// Esto asegura que si el usuario navega entre páginas, el tema se aplique
// incluso antes de que el DOM esté completamente cargado.
// El script en <head> ya hace esto para la carga inicial de la página.
applyTheme();

// 2. Cuando el DOM esté completamente cargado:
document.addEventListener('DOMContentLoaded', () => {
    // Sincroniza los interruptores con el estado actual del tema.
    syncThemeToggles();

    // Añade el event listener a todos los interruptores de modo oscuro en la página.
    document.querySelectorAll('.dark-mode-toggle-switch').forEach(toggle => {
        toggle.addEventListener('change', handleThemeToggle);
    });
});