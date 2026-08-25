# Arquitectura del Proyecto: Óptica Visual - Sistema de Gestión

Este documento sirve como guía arquitectónica viva para el desarrollo del sistema de gestión para la óptica, diseñado bajo una **Arquitectura en Capas (Layered Architecture)** en el backend y un frontend desacoplado.

## 1. Objetivo del Proyecto
El objetivo es construir una aplicación web fullstack y responsiva para gestionar las operaciones diarias de una óptica. Permitirá:
*   **Registrar Clientes**: Guardar la información básica de contacto de los clientes.
*   **Registrar Productos**: Controlar el inventario de armazones, lentes u otros accesorios de óptica.
*   **Registrar Ventas**: Facturar productos a clientes, calculando totales y disminuyendo automáticamente el stock en inventario.

---

## 2. Stack Tecnológico

*   **Backend**:
    *   **Node.js**: Entorno de ejecución para Javascript en el servidor.
    *   **Express**: Framework web minimalista para crear la API REST.
    *   **SQLite**: Base de datos relacional ligera integrada. Se almacena en un solo archivo local (`database.sqlite`), facilitando el desarrollo rápido sin dependencias externas.
*   **Frontend**:
    *   **React** (vía **Vite**): Biblioteca para interfaces de usuario dinámicas.
    *   **Bootstrap 5 (vía CDN)**: Estructura de diseño rápido y responsiva.
    *   **Vanilla CSS**: Para personalizaciones estéticas de alto nivel y transiciones suaves.
    *   **Axios**: Cliente HTTP para realizar peticiones a la API del backend.

---

## 3. Estructura de Carpetas Propuesta

```text
proyecto-optica/
├── backend/
│   ├── src/
│   │   ├── config/             # Conexión a la base de datos (SQLite)
│   │   ├── routes/             # Endpoints / Rutas de la API (HTTP -> Controlador)
│   │   ├── controllers/        # Controladores (Extracción de req, llamadas a servicios, Response)
│   │   ├── services/           # Lógica de negocio (Cálculos, validaciones complejas de negocio)
│   │   ├── repositories/       # Consultas SQL directas a la base de datos
│   │   ├── app.js              # Configuración de Express (Middlewares globales)
│   │   └── index.js            # Punto de entrada (Inicio del servidor en el puerto 3000)
│   ├── database.sqlite         # Base de datos local
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                # Peticiones HTTP al Backend (Axios)
    │   ├── components/         # Componentes visuales reutilizables
    │   ├── pages/              # Vistas completas de la aplicación (Clientes, Productos, Ventas)
    │   ├── App.jsx             # Enrutamiento de páginas
    │   ├── main.jsx            # Inicialización de React
    │   └── index.css           # Estilos personalizados (CSS vanilla)
    └── index.html
```

---

## 4. Flujo de Datos en el Backend

El flujo sigue una regla estricta: **una capa solo puede comunicarse con la capa inmediatamente inferior**.

1.  **Request HTTP**: El cliente (frontend) hace una petición (ej: `POST http://localhost:3000/api/clientes`).
2.  **Rutas (`routes/`)**: Detecta la ruta `/api/clientes` y la transfiere al controlador correspondiente (`cliente.controller.js`).
3.  **Controlador (`controllers/`)**:
    *   Extrae los datos de la petición (ej: `req.body` con los datos del cliente).
    *   Llama al servicio de negocio (`cliente.service.js`).
    *   Recibe el resultado y devuelve la respuesta HTTP al frontend con el código de estado adecuado (ej: `201 Created`).
4.  **Servicio (`services/`)**:
    *   Contiene las reglas del negocio (ej: validar que el nombre no esté vacío, validar formato de email).
    *   Si todo es correcto, llama al repositorio (`cliente.repository.js`).
5.  **Repositorio (`repositories/`)**:
    *   Ejecuta la consulta SQL directamente en SQLite (ej: `INSERT INTO clientes...`).
    *   Devuelve el cliente insertado al Servicio, que lo sube al Controlador, y este lo envía como JSON al Frontend.

---

## 5. Glosario de Conceptos Clave (Para Aprendizaje)

*   **API REST**: Es un canal de comunicación estándar en la web que permite que el Frontend y el Backend hablen usando formato JSON y métodos HTTP (GET, POST, PUT, DELETE).
*   **Middleware**: Funciones que se ejecutan "en el medio" de una petición y una respuesta. Sirven para tareas comunes como registrar logs en la consola, manejar errores globales, o verificar datos antes de llegar a las rutas.
*   **Inyección de Dependencias (Básica)**: Es pasarle a una clase o servicio las herramientas que necesita para funcionar en lugar de que las cree por sí mismo. Esto hace que el código sea fácil de probar y de cambiar en el futuro.
*   **Transacción SQL**: Un grupo de operaciones SQL que se ejecutan como una única unidad. Si una operación falla, todas se cancelan (Rollback) para evitar que la base de datos quede a medias (ej: registrar una venta pero no descontar stock, o viceversa).
