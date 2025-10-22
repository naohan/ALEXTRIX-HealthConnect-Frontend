/**
 * ALEXTRIX HealthConnect - Configuración del Frontend
 * 
 * Cambia entre desarrollo local y producción modificando la variable ENVIRONMENT
 */

const CONFIG = {
    // Cambiar entre 'development' (local) y 'production' (Render)
    ENVIRONMENT: 'production',  // ← Cambiado a producción
    
    development: {
        API_BASE_URL: 'http://127.0.0.1:8000/api',
        WS_URL: 'ws://127.0.0.1:8000/ws/datos'
    },
    
    production: {
        // Backend desplegado en Render
        API_BASE_URL: 'https://alextrix-healthconnect.onrender.com/api',
        WS_URL: 'wss://alextrix-healthconnect.onrender.com/ws/datos'
    },
    
    // Método para obtener la configuración actual
    get() {
        return this[this.ENVIRONMENT];
    }
};

// Exportar configuración
window.APP_CONFIG = CONFIG.get();

