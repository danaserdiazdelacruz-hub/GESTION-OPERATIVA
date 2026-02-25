# Centinela v5.0 — React + TypeScript + Tailwind CSS

Plataforma de Seguridad Operativa migrada de vanilla JS a React + TypeScript.

---

## Opción A: Abrir en VS Code (Recomendado)

### Requisitos previos
- **Node.js** v18+ instalado → [nodejs.org](https://nodejs.org)
- **VS Code** instalado → [code.visualstudio.com](https://code.visualstudio.com)

### Pasos

```bash
# 1. Descomprime el ZIP en una carpeta
# 2. Abre terminal en esa carpeta

# 3. Instala las dependencias
npm install

# 4. Arranca el servidor de desarrollo
npm run dev

# 5. Abre en el navegador la URL que aparece (normalmente http://localhost:5173)
```

### Para abrir en VS Code
```bash
code .
```

---

## Opción B: Abrir en StackBlitz

### Método 1: Drag & Drop
1. Ve a [stackblitz.com](https://stackblitz.com)
2. Haz clic en **"Start a new project"** → **"Upload folder"**
3. Arrastra la carpeta `centinela` descomprimida
4. StackBlitz detectará el `package.json` e instalará todo automáticamente
5. Espera unos segundos y la app arranca en el preview

### Método 2: Desde GitHub (si subes el repo)
1. Sube la carpeta a un repo en GitHub
2. Ve a: `https://stackblitz.com/github/TU_USUARIO/centinela`
3. Se abre directo

---

## Credenciales por defecto

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin` | Super Admin |

> **Importante:** Cambia la contraseña después del primer login.

---

## Estado actual

### ✅ Fase 1 + 2 completadas
- Proyecto scaffold (Vite + React + TS + Tailwind)
- Sistema de tipos completo (`/src/types/`)
- Configuración y constantes (`/src/config/`)
- Servicios de base de datos y crypto (`/src/services/`)
- Contextos de Auth, Alertas y Evaluación (`/src/context/`)
- Login funcional con sesiones persistentes
- Shell de la app con header, tabs y permisos
- Home page con métricas del dashboard

### 🔜 Pendiente (Fases 3–5)
- Checklist / Evaluación (flujo completo)
- Historial de evaluaciones
- Plan de Acción
- Análisis con gráficas
- Configuración (usuarios, checklist editor, etc.)

---

## Estructura del proyecto

```
src/
├── types/          → Interfaces y tipos TypeScript
├── config/         → Constantes, checklist default, state machine
├── services/       → Base de datos (Dexie), auth, crypto
├── context/        → Auth, Alert, Evaluation providers
├── components/
│   ├── layout/     → AppShell, Header, Tabs, Loading
│   ├── ui/         → Modal, AlertToast, StatusBadge, MetricCard
│   └── auth/       → LoginForm
├── pages/          → HomePage + placeholders
├── styles/         → globals.css (Tailwind + CSS vars)
├── App.tsx         → Componente raíz
└── main.tsx        → Punto de entrada
```

---

## Base de datos

Usa **Dexie.js** (IndexedDB local) — la misma DB que la versión vanilla. Si ya tenías datos guardados en el navegador, **se mantienen**. No se pierde nada.

---

## Astria Lab © 2025
