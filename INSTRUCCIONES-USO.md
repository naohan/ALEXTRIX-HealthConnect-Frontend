# 📖 INSTRUCCIONES DE USO - ALEXTRIX HealthConnect Frontend

## 🎯 Guía Rápida de Inicio

### 1️⃣ Configuración Inicial

#### **Opción A: Desarrollo Local (Recomendado para empezar)**

1. **Asegúrate de que el backend esté ejecutándose:**
   ```bash
   # En la carpeta del backend
   cd ALEXTRIX-HealthConnect/ALEXTRIX-HealthConnect
   uvicorn main:app --reload
   ```

2. **Abre el frontend:**
   - Opción 1 (Recomendada): Usa **Live Server** en VS Code
     - Clic derecho en `index.html` → "Open with Live Server"
   - Opción 2: Abre `index.html` directamente en tu navegador
     - Doble clic en el archivo

3. **El frontend ya está configurado por defecto para desarrollo local** ✅
   - No necesitas cambiar nada en `config.js`

#### **Opción B: Producción (Render, Heroku, etc.)**

1. **Edita el archivo `config.js`:**
   ```javascript
   const CONFIG = {
       ENVIRONMENT: 'production',  // ← Cambiar de 'development' a 'production'
       
       production: {
           API_BASE_URL: 'https://tu-backend.onrender.com/api',  // ← Tu URL de Render
           WS_URL: 'wss://tu-backend.onrender.com/ws/datos'      // ← Nota: wss:// no ws://
       }
   };
   ```

2. **Despliega el frontend:**
   - GitHub Pages
   - Netlify
   - Vercel
   - Render (Static Site)

---

## 🗺️ Cómo Funciona el Mapa GPS

### Flujo de Datos GPS:

```
📱 Smartwatch (Wear OS)
    ↓ Envía GPS
🔧 Backend (FastAPI)
    ↓ Guarda en PostgreSQL (columnas lat, lon)
    ↓ Devuelve como objeto {lat, lon}
🌐 Frontend (Dashboard)
    ↓ Recibe por WebSocket
📍 Mapa (Leaflet.js)
    ✅ Actualiza automáticamente
```

### Características del Mapa:

✅ **Actualización en Tiempo Real**: Cuando llega un nuevo dato GPS por WebSocket  
✅ **Marcador Animado**: Icono rojo con animación de rebote  
✅ **Centrado Inteligente**:
- Primera ubicación → Centra el mapa con zoom 15
- Actualizaciones → Mueve suavemente sin cambiar zoom

✅ **Popup Informativo**: Click en el marcador para ver:
- Coordenadas exactas (6 decimales)
- Hora de última actualización

### Formato de Datos GPS del Backend:

```json
{
  "gps": {
    "lat": -16.3989,
    "lon": -71.537
  }
}
```

**El backend debe devolver este formato tanto en:**
- `GET /api/sensores/ultimo`
- `GET /api/sensores`
- Mensajes WebSocket

---

## 🧪 Cómo Probar el Sistema

### Método 1: Usar el Test Sender (Más Fácil) ⭐

1. **Abre `test-sender.html` en tu navegador**
2. **Selecciona un escenario de prueba:**
   - ✅ Normal
   - ⚠️ Estrés Alto
   - ❗ Baja Oxigenación
   - 🔥 Golpe de Calor
3. **Click en "Enviar Datos"**
4. **Abre `index.html` en otra pestaña** → Verás los datos en tiempo real!

### Método 2: Usar curl

```bash
# Datos normales
curl -X POST http://127.0.0.1:8000/api/sensores \
  -H "Content-Type: application/json" \
  -d '{
    "idUsuario": "user123",
    "frecuenciaCardiaca": 75,
    "spo2": 98,
    "skinTemp": 36.5,
    "alerta": "Normal",
    "gps": {"lat": -16.3989, "lon": -71.537},
    "timestamp": "2025-01-22T10:30:00"
  }'

# Estrés alto (genera alerta)
curl -X POST http://127.0.0.1:8000/api/sensores \
  -H "Content-Type: application/json" \
  -d '{
    "idUsuario": "user123",
    "frecuenciaCardiaca": 135,
    "spo2": 96,
    "skinTemp": 37.2,
    "alerta": "Normal",
    "gps": {"lat": -16.3995, "lon": -71.5375},
    "timestamp": "2025-01-22T10:35:00"
  }'
```

### Método 3: Desde el Smartwatch (Producción)

El smartwatch debe enviar datos al endpoint:
```
POST https://tu-backend.onrender.com/api/sensores
```

---

## 📊 Páginas Disponibles

### `index.html` - Dashboard Completo
**Incluye:**
- ✅ Métricas en tiempo real
- ✅ Gráficos históricos (Chart.js)
- ✅ Mapa GPS interactivo
- ✅ Tabla de registros históricos
- ✅ Sistema de alertas

**Cuándo usar:** Monitoreo completo del paciente

---

### `realtime.html` - Vista Simplificada
**Incluye:**
- ✅ Solo métricas actuales
- ✅ Alertas en tiempo real
- ✅ Sin gráficos ni mapa

**Cuándo usar:** Vista rápida en pantallas pequeñas

---

### `test-sender.html` - Herramienta de Pruebas
**Incluye:**
- ✅ Formulario para enviar datos de prueba
- ✅ Escenarios predefinidos
- ✅ Envío múltiple automático

**Cuándo usar:** Desarrollo y pruebas sin smartwatch

---

## 🔍 Verificación de Funcionamiento

### ✅ Checklist de Verificación:

1. **Backend funcionando:**
   - [ ] `http://127.0.0.1:8000/` muestra mensaje de servidor activo
   - [ ] `http://127.0.0.1:8000/docs` abre Swagger UI

2. **Frontend conectado:**
   - [ ] Estado de conexión muestra "Conectado" (verde)
   - [ ] No hay errores en la consola del navegador (F12)

3. **Datos llegando:**
   - [ ] Métricas se actualizan cuando envías datos
   - [ ] Gráficos muestran las líneas de tiempo
   - [ ] Mapa muestra el marcador rojo
   - [ ] Tabla histórica se llena con registros

4. **GPS funcionando:**
   - [ ] Coordenadas se muestran en la tarjeta de ubicación
   - [ ] Marcador aparece en el mapa
   - [ ] Click en marcador muestra popup con info
   - [ ] Al enviar nuevo GPS, el mapa se mueve suavemente

---

## ❗ Solución de Problemas

### Problema: "Desconectado" en estado de conexión

**Causa:** Backend no está ejecutándose  
**Solución:**
```bash
cd ALEXTRIX-HealthConnect/ALEXTRIX-HealthConnect
uvicorn main:app --reload
```

---

### Problema: Mapa no se actualiza

**Causa 1:** GPS no viene en el formato correcto  
**Solución:** Verifica que el backend devuelva:
```json
"gps": {"lat": -16.3989, "lon": -71.537}
```

**Causa 2:** Coordenadas null o undefined  
**Solución:** Asegúrate de enviar valores válidos de lat/lon

---

### Problema: Error de CORS

**Error en consola:** `Access-Control-Allow-Origin`  
**Solución:** En el backend (`main.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o especifica tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Problema: WebSocket se desconecta constantemente

**Causa:** Firewall o red bloqueando WebSocket  
**Solución:**
1. Verifica que el puerto 8000 esté abierto
2. Prueba desactivar temporalmente el antivirus/firewall
3. En producción, usa `wss://` (WebSocket seguro)

---

## 📱 Ubicaciones de Ejemplo (Arequipa, Perú)

Para probar el mapa con ubicaciones reales de Arequipa:

| Lugar | Latitud | Longitud |
|-------|---------|----------|
| TECSUP Arequipa | -16.4328 | -71.5450 |
| Plaza de Armas | -16.3988 | -71.5350 |
| Volcán Misti | -16.2937 | -71.4091 |
| Yanahuara | -16.3954 | -71.5450 |

---

## 🎨 Personalización

### Cambiar ubicación inicial del mapa:

Edita `dashboard.js` líneas 296-297:
```javascript
const centerLat = -16.3989;  // ← Tu latitud
const centerLon = -71.537;   // ← Tu longitud
```

### Cambiar zoom inicial:

Edita `dashboard.js` línea 298:
```javascript
this.map = L.map('map').setView([centerLat, centerLon], 14);
//                                                        ↑ zoom (1-20)
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Verifica los logs del backend** (terminal donde ejecutas uvicorn)
3. **Usa test-sender.html** para verificar que el backend funciona
4. **Revisa que el formato GPS sea correcto** en la respuesta del backend

---

**© 2025 ALEXTRIX HealthConnect - TECSUP Arequipa**


