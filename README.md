# ALEXTRIX HealthConnect Dashboard

Dashboard web interactivo y en tiempo real para monitoreo de datos fisiológicos enviados desde un smartwatch (Xiaomi Watch 2 con Wear OS) a un servidor FastAPI conectado a MySQL.

## 🎯 Características

- **Monitoreo en Tiempo Real**: Visualización instantánea de datos médicos via WebSocket
- **Métricas de Salud**: Frecuencia cardíaca, SpO₂, temperatura corporal y ubicación GPS
- **Gráficos Dinámicos**: Visualización temporal con Chart.js
- **Mapa Interactivo**: Ubicación en tiempo real con Leaflet.js
- **Sistema de Alertas**: Notificaciones automáticas para valores críticos
- **Historial de Datos**: Tabla con los últimos registros del paciente

## 📁 Estructura del Proyecto

```
ALEXTRIX-HealthConnect-Frontend/
│
├── index.html          # Página principal del dashboard
├── realtime.html       # Página de vista en tiempo real simplificada
├── config.js           # ⚙️ Configuración de URLs (desarrollo/producción)
├── dashboard.js        # Lógica y conexión con API/WebSocket
├── charts.js           # Configuración de gráficos Chart.js
├── styles.css          # Diseño y estilos del panel
├── img/                # Carpeta para logo e imágenes
│   └── logo.png        # Logo de ALEXTRIX (opcional)
└── README.md           # Este archivo
```

## 🚀 Instalación y Uso

1. **Clonar o descargar** los archivos del proyecto
2. **Colocar el logo** (opcional) en la carpeta `img/logo.png`
3. **Configurar la conexión al backend** en `config.js`
4. **Abrir index.html** en un navegador web moderno (o usar Live Server)

### Configuración del Servidor

#### Desarrollo Local (por defecto)
El frontend está configurado por defecto para conectarse a:
- **WebSocket**: `ws://127.0.0.1:8000/ws/datos`
- **API REST**: `http://127.0.0.1:8000/api/`

#### Producción (Render u otro hosting)
1. Abre el archivo `config.js`
2. Cambia `ENVIRONMENT: 'development'` a `ENVIRONMENT: 'production'`
3. Actualiza las URLs de producción:
   ```javascript
   production: {
       API_BASE_URL: 'https://tu-backend.onrender.com/api',
       WS_URL: 'wss://tu-backend.onrender.com/ws/datos'
   }
   ```

**Nota:** En producción usa `wss://` (WebSocket seguro) en lugar de `ws://`

## 🔧 Funcionalidades Técnicas

### Conexión WebSocket
```javascript
// Conexión automática con reconexión
const socket = new WebSocket("ws://127.0.0.1:8000/ws/datos");
```

### APIs Utilizadas
- `GET /api/sensores/ultimo` - Último registro del paciente
- `GET /api/sensores` - Historial de registros

### Estructura de Datos Esperada
```json
{
  "idUsuario": "string",
  "frecuenciaCardiaca": number,
  "spo2": number,
  "skinTemp": number,
  "gps": {
    "lat": number,
    "lon": number
  },
  "timestamp": "ISO string"
}
```

### 📍 Sistema de Mapas GPS

El dashboard incluye un **mapa interactivo en tiempo real** usando Leaflet.js que:

1. **Actualización Automática**: Cuando llega un nuevo dato GPS por WebSocket, el mapa se actualiza automáticamente
2. **Marcador Animado**: El marcador tiene una animación de rebote para mejor visibilidad
3. **Centrado Inteligente**: 
   - Primera ubicación: centra el mapa con zoom 15
   - Actualizaciones siguientes: mueve suavemente el mapa (panTo) sin cambiar el zoom
4. **Popup Informativo**: Click en el marcador para ver:
   - Coordenadas exactas (lat/lon con 6 decimales)
   - Hora de última actualización
5. **Diseño Adaptativo**: El popup usa el tema oscuro del dashboard

**Formato GPS requerido del backend:**
```javascript
"gps": {
  "lat": -16.3989,  // Latitud (número decimal)
  "lon": -71.537     // Longitud (número decimal)
}
```

**Ejemplo de flujo:**
1. Smartwatch envía GPS → Backend
2. Backend guarda en PostgreSQL como `lat` y `lon` (columnas separadas)
3. Backend devuelve al frontend como objeto `gps: {lat, lon}`
4. Frontend actualiza mapa automáticamente

## ⚠️ Sistema de Alertas

El dashboard detecta automáticamente valores críticos:

- **Frecuencia Cardíaca**: 
  - Normal: 60-100 BPM
  - Alerta: >100 BPM (Elevado)
  - Crítico: >130 BPM (Estrés)

- **SpO₂ (Oxigenación)**:
  - Normal: 97-100%
  - Alerta: 93-97% (Moderada)
  - Crítico: <93% (Baja oxigenación)

- **Temperatura**:
  - Normal: 36.1-37.2°C
  - Alerta: 37.2-38.5°C (Fiebre)
  - Crítico: >38.5°C (Golpe de calor)

## 🎨 Diseño

- **Tema Oscuro**: Fondo #0e1117 para mejor visibilidad en entornos médicos
- **Tipografía**: Poppins para legibilidad profesional
- **Colores**:
  - Verde (#16a34a): Normal
  - Amarillo (#facc15): Advertencia
  - Rojo (#dc2626): Crítico
- **Responsivo**: Compatible con dispositivos móviles y tablets

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsivo con variables CSS
- **JavaScript ES6+**: Lógica del dashboard
- **Chart.js**: Gráficos dinámicos de tiempo real
- **Leaflet.js**: Mapas interactivos
- **FontAwesome**: Iconografía médica

## 📱 Compatibilidad

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Dispositivos móviles (iOS/Android)

## 🔒 Seguridad

- Conexiones WebSocket seguras en producción
- Validación de datos en tiempo real
- Manejo de errores robusto

## 📞 Soporte

Proyecto desarrollado para **TECSUP Arequipa** como parte del sistema ALEXTRIX HealthConnect.

---

**© 2025 ALEXTRIX HealthConnect - TECSUP Arequipa**
