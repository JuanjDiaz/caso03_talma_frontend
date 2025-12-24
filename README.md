# 🚀 TIVIT Automatización de guías aéreas - Frontend

Interfaz moderna y escalable para la automatización de guías aéreas mediante IA generativa.

## 🏗 Arquitectura del Frontend

El sistema está construido con un enfoque modular y escalable (Feature-Based Architecture):
* **Framework:** React 19 + Vite 7
* **Lenguaje:** JavaScript (preparado para TypeScript)
* **Estilos:** Tailwind CSS 3.4 + Lucide React (Iconografía)
* **Estado Global:** Zustand / TanStack Query

## ⚙️ Configuración

1. Variables de entorno:

Configuras claves en el archivo .env:

Claves críticas:

* BACKEND_URL: URL del backend.

2. Instalación de dependencias:

```bash
npm install
```

3. Ejecución:

```bash
npm run dev
```


## 🔒 Seguridad
* Autenticación: JWT (JSON Web Tokens).
* Rate Limiting: Protección contra abuso de API.
* Validación: Pydantic para validación estricta de datos.
* CORS: Configurado para permitir solo orígenes confiables.

## 📂 Estructura del Proyecto

```text
src/
├── api/            # Configuración de Axios e interceptores para el Backend.
├── auth/           # Contexto/Store para proteger rutas y verificar JWT.
├── components/     # Componentes UI reutilizables (Atomic Design - UI folder).
├── config/         # Constantes, variables de entorno y configuración global.
├── features/       # Módulos de negocio aislados (Análisis, Autenticación).
│   ├── analysis/   # Extracción de datos de guías, carga de archivos y lógica de IA.
│   └── auth/       # Pantallas de Login y recuperación de cuenta.
├── hooks/          # Hooks personalizados compartidos por toda la aplicación.
├── layouts/        # Plantillas de diseño (Sidebar, Header, Main wrapper).
├── lib/            # Instancias de librerías externas.
├── pages/          # Vistas principales de la aplicación (Rutas de nivel superior).
├── routes/         # Configuración y protección de rutas con React Router.
├── store/          # Manejo de estado global persistente con Zustand.
└── types/          # Definiciones de estructuras de datos e interfaces.