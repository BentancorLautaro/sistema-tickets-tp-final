# Sistema de tickets — TP final

Aplicación full stack para registrar y administrar solicitudes de soporte. El backend usa Node.js, Express y TypeScript; el frontend usa React, TypeScript y Vite. Los tickets se guardan localmente en `backend/src/data/tickets.json`, por lo que no hace falta instalar una base de datos.

## Arquitectura

### Backend por capas
- **routes:** define `GET /api/tickets`, `POST /api/tickets` y `PATCH /api/tickets/:id`.
- **controllers:** recibe HTTP, valida la estructura de entrada y devuelve respuestas.
- **services:** concentra las reglas de negocio y vuelve a validar los datos de forma independiente.
- **models:** define los tipos, estados y prioridades.
- **data:** persiste el listado en un archivo JSON local.
- **events:** contiene el `EventEmitter` y el listener de alertas.

La validación es doble: el controller verifica título, tipos y valores permitidos; el service repite las comprobaciones antes de modificar la persistencia. El PATCH permite cambiar estado, prioridad y persona asignada.

### Eventos
Al crear o actualizar un ticket cuya prioridad sea `urgente`, el service emite `ticket:urgente`. El listener imprime en consola una alerta con identificador, título, descripción, estado, asignación y fechas.

### Agentes
- `.agents/revisor.md`: auditor de solo lectura (`readonly: true`), orientado a arquitectura y calidad.
- `.agents/desarrollador.md`: agente de implementación con herramientas declaradas y un flujo de trabajo para cambios y verificaciones.

## Requisitos
- Node.js 20 o superior (recomendado).
- npm.

## Puesta en marcha

Abrí dos terminales desde la carpeta raíz del proyecto.

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Servidor: `http://localhost:3001`  
Salud: `http://localhost:3001/api/health`

El CORS está configurado explícitamente para `http://localhost:5173`. Se puede cambiar con la variable `FRONTEND_ORIGIN`.

### 2. Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
Aplicación: `http://localhost:5173`

Opcionalmente, configurá `VITE_API_URL` si el backend está en otra dirección. Por defecto apunta a `http://localhost:3001/api`.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tickets` | Lista tickets |
| POST | `/api/tickets` | Crea un ticket |
| PATCH | `/api/tickets/:id` | Actualiza estado, prioridad o asignación |

Ejemplo de creación:
```json
{
  "title": "No puedo iniciar sesión",
  "description": "El sistema rechaza mis credenciales.",
  "priority": "urgente",
  "assignedTo": "Soporte"
}
```

Estados válidos: `abierto`, `en_progreso`, `resuelto`, `cerrado`.  
Prioridades válidas: `baja`, `media`, `alta`, `urgente`.

## Compilación de producción

```bash
# En backend/
npm run build
npm start

# En frontend/
npm run build
npm run preview
```

Los datos quedan en `backend/src/data/tickets.json`. Para reiniciar el conjunto de datos, detené el backend y reemplazá el contenido del archivo por `[]`.
