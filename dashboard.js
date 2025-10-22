/**
 * ALEXTRIX HealthConnect Dashboard
 * Lógica principal para conexión WebSocket y manejo de datos en tiempo real
 */

class HealthConnectDashboard {
    constructor() {
        this.socket = null;
        // Usar configuración del archivo config.js si está disponible
        this.apiBaseUrl = window.APP_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';
        this.wsUrl = window.APP_CONFIG?.WS_URL || 'ws://127.0.0.1:8000/ws/datos';
        this.map = null;
        this.marker = null;
        this.mapInitialized = false;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        
        this.init();
    }

    init() {
        this.setupWebSocket();
        this.initMap();
        this.loadHistoricalData();
        this.setupEventListeners();
        
        // Cargar datos iniciales
        this.fetchLastRecord();
        
        // Actualizar datos históricos cada 30 segundos
        setInterval(() => this.loadHistoricalData(), 30000);
    }

    setupWebSocket() {
        try {
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                console.log('WebSocket conectado');
                this.updateConnectionStatus(true);
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.updateMetrics(data);
                    this.updateMap(data.gps);
                } catch (error) {
                    console.error('Error parsing WebSocket data:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket desconectado');
                this.updateConnectionStatus(false);
                this.reconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus(false);
            };
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
            this.updateConnectionStatus(false);
        }
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.setupWebSocket();
            }, 3000);
        } else {
            console.error('Máximo número de intentos de reconexión alcanzado');
        }
    }

    updateConnectionStatus(connected) {
        this.isConnected = connected;
        const statusElement = document.getElementById('connectionStatus');
        const statusText = document.getElementById('connectionText');
        const indicator = statusElement.querySelector('.status-indicator');

        if (connected) {
            statusElement.className = 'connection-status connected';
            statusText.textContent = 'Conectado';
            indicator.className = 'fas fa-circle status-indicator connected';
        } else {
            statusElement.className = 'connection-status disconnected';
            statusText.textContent = 'Desconectado';
            indicator.className = 'fas fa-circle status-indicator disconnected';
        }
    }

    updateMetrics(data) {
        // Actualizar frecuencia cardíaca
        this.updateHeartRate(data.frecuenciaCardiaca);
        
        // Actualizar SpO2
        this.updateSpo2(data.spo2);
        
        // Actualizar temperatura
        this.updateTemperature(data.skinTemp);
        
        // Actualizar ubicación
        this.updateLocation(data.gps);
        
        // Actualizar mapa con GPS
        this.updateMap(data.gps);
    }

    updateHeartRate(bpm) {
        const valueElement = document.getElementById('heartRateValue');
        const statusElement = document.getElementById('heartRateStatus');
        const cardElement = document.getElementById('heartRateCard');

        if (valueElement) {
            valueElement.textContent = bpm || '--';
        }

        let status = 'Normal';
        let statusClass = 'normal';

        if (bpm) {
            if (bpm > 130) {
                status = 'Alerta de Estrés';
                statusClass = 'critical';
                this.showAlert('⚠️ Estrés alto detectado: ' + bpm + ' BPM', 'danger');
            } else if (bpm > 100) {
                status = 'Elevado';
                statusClass = 'warning';
            } else if (bpm < 60) {
                status = 'Bajo';
                statusClass = 'warning';
            }
        }

        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `metric-status ${statusClass}`;
        }

        if (cardElement) {
            cardElement.className = `metric-card heart-rate ${statusClass}`;
        }

        // Actualizar gráfico
        if (window.heartRateChart) {
            this.updateChart(window.heartRateChart, bpm);
        }
    }

    updateSpo2(spo2) {
        const valueElement = document.getElementById('spo2Value');
        const statusElement = document.getElementById('spo2Status');
        const cardElement = document.getElementById('spo2Card');

        if (valueElement) {
            valueElement.textContent = spo2 || '--';
        }

        let status = 'Normal';
        let statusClass = 'normal';

        if (spo2) {
            if (spo2 < 93) {
                status = 'Oxigenación Baja';
                statusClass = 'critical';
                this.showAlert('❗ Oxigenación baja: ' + spo2 + '%', 'danger');
            } else if (spo2 < 97) {
                status = 'Moderada';
                statusClass = 'warning';
            }
        }

        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `metric-status ${statusClass}`;
        }

        if (cardElement) {
            cardElement.className = `metric-card spo2 ${statusClass}`;
        }

        // Actualizar gráfico
        if (window.spo2Chart) {
            this.updateChart(window.spo2Chart, spo2);
        }
    }

    updateTemperature(temp) {
        const valueElement = document.getElementById('temperatureValue');
        const statusElement = document.getElementById('temperatureStatus');
        const cardElement = document.getElementById('temperatureCard');

        if (valueElement) {
            valueElement.textContent = temp || '--';
        }

        let status = 'Normal';
        let statusClass = 'normal';

        if (temp) {
            if (temp > 38) {
                status = 'Golpe de Calor';
                statusClass = 'critical';
                this.showAlert('🔥 Posible golpe de calor: ' + temp + '°C', 'danger');
            } else if (temp > 37.5) {
                status = 'Fiebre';
                statusClass = 'warning';
            } else if (temp < 36) {
                status = 'Hipotermia';
                statusClass = 'warning';
            }
        }

        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `metric-status ${statusClass}`;
        }

        if (cardElement) {
            cardElement.className = `metric-card temperature ${statusClass}`;
        }

        // Actualizar gráfico
        if (window.temperatureChart) {
            this.updateChart(window.temperatureChart, temp);
        }
    }

    updateLocation(gps) {
        const latElement = document.getElementById('latitudeValue');
        const lonElement = document.getElementById('longitudeValue');
        const statusElement = document.getElementById('locationStatus');

        if (latElement && lonElement && gps) {
            latElement.textContent = gps.lat ? gps.lat.toFixed(6) : '--';
            lonElement.textContent = gps.lon ? gps.lon.toFixed(6) : '--';

            if (statusElement) {
                statusElement.textContent = gps.lat && gps.lon ? 'Ubicado' : 'Desconocida';
                statusElement.className = `metric-status ${gps.lat && gps.lon ? 'normal' : 'warning'}`;
            }
        }
    }

    updateMap(gps) {
        if (this.map && gps && gps.lat && gps.lon) {
            const latLng = [gps.lat, gps.lon];
            
            if (this.marker) {
                // Actualizar posición del marcador existente
                this.marker.setLatLng(latLng);
                
                // Centrar mapa en la nueva ubicación con animación suave
                this.map.panTo(latLng);
            } else {
                // Crear marcador nuevo con icono personalizado
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: '<i class="fas fa-map-marker-alt" style="font-size: 32px; color: #dc2626;"></i>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });
                
                this.marker = L.marker(latLng, { icon: customIcon }).addTo(this.map);
                
                // Centrar mapa en la primera ubicación
                this.map.setView(latLng, 15);
            }
            
            // Actualizar popup con información actualizada
            this.marker.bindPopup(`
                <div style="font-family: 'Poppins', sans-serif; padding: 8px;">
                    <strong style="color: #dc2626; font-size: 14px;">📍 Ubicación Actual</strong><br><br>
                    <strong>Latitud:</strong> ${gps.lat.toFixed(6)}<br>
                    <strong>Longitud:</strong> ${gps.lon.toFixed(6)}<br>
                    <strong>Actualizado:</strong> ${new Date().toLocaleTimeString()}
                </div>
            `);
            
            // Abrir popup automáticamente en la primera ubicación
            if (!this.mapInitialized) {
                this.marker.openPopup();
                this.mapInitialized = true;
            }
        }
    }

    initMap() {
        // Coordenadas de referencia (Arequipa, Perú)
        const centerLat = -16.3989;
        const centerLon = -71.537;
        
        this.map = L.map('map').setView([centerLat, centerLon], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Marcador inicial
        this.marker = L.marker([centerLat, centerLon]).addTo(this.map);
    }

    updateChart(chart, value) {
        if (chart && value !== null && value !== undefined) {
            const now = new Date();
            const timeLabel = now.toLocaleTimeString();
            
            chart.data.labels.push(timeLabel);
            chart.data.datasets[0].data.push(value);
            
            // Mantener solo los últimos 20 puntos
            if (chart.data.labels.length > 20) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.update('none');
        }
    }

    showAlert(message, type = 'warning') {
        const alertBanner = document.getElementById('alertBanner');
        const alertMessage = document.getElementById('alertMessage');
        
        if (alertBanner && alertMessage) {
            alertMessage.textContent = message;
            alertBanner.className = `alert-banner ${type}`;
            alertBanner.style.display = 'block';
            
            // Auto-hide después de 5 segundos
            setTimeout(() => {
                this.closeAlert();
            }, 5000);
            
            // Reproducir sonido de alerta (opcional)
            this.playAlertSound();
        }
    }

    closeAlert() {
        const alertBanner = document.getElementById('alertBanner');
        if (alertBanner) {
            alertBanner.style.display = 'none';
        }
    }

    playAlertSound() {
        try {
            // Crear un audio temporal para la alerta
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('No se pudo reproducir el sonido de alerta:', error);
        }
    }

    async fetchLastRecord() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sensores/ultimo`);
            if (response.ok) {
                const data = await response.json();
                this.updateMetrics(data);
            }
        } catch (error) {
            console.error('Error fetching last record:', error);
        }
    }

    async loadHistoricalData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sensores`);
            if (response.ok) {
                const data = await response.json();
                this.updateHistoricalTable(data);
            }
        } catch (error) {
            console.error('Error loading historical data:', error);
        }
    }

    updateHistoricalTable(data) {
        const tbody = document.getElementById('historicalData');
        if (!tbody || !Array.isArray(data)) return;

        // Mostrar solo los últimos 10 registros
        const lastRecords = data.slice(-10).reverse();
        
        if (lastRecords.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay datos disponibles</td></tr>';
            return;
        }

        tbody.innerHTML = lastRecords.map(record => `
            <tr>
                <td>${record.idUsuario || '--'}</td>
                <td>${record.frecuenciaCardiaca || '--'}</td>
                <td>${record.spo2 || '--'}</td>
                <td>${record.skinTemp || '--'}</td>
                <td>${record.gps ? record.gps.lat.toFixed(4) : '--'}</td>
                <td>${record.gps ? record.gps.lon.toFixed(4) : '--'}</td>
                <td>${record.timestamp ? new Date(record.timestamp).toLocaleString() : '--'}</td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Listener para cerrar alertas
        window.closeAlert = () => this.closeAlert();
        
        // Listener para errores globales
        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
        });
    }
}

// Función global para cerrar alertas (usada desde HTML)
function closeAlert() {
    if (window.dashboard) {
        window.dashboard.closeAlert();
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new HealthConnectDashboard();
});
