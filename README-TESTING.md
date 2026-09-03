# Testing de la Óptica 🧪

Este proyecto cuenta con un sistema de testing automatizado implementado en Vitest para ambas partes del sistema (Backend y Frontend), aislando las pruebas de la base de datos de producción y falseando (mocking) las conexiones donde corresponde.

## Requisitos Previos

Asegurate de haber instalado las dependencias de prueba en ambas carpetas:
```bash
cd backend
npm install
cd ../frontend
npm install
```

## Backend

Los tests del backend prueban tanto la lógica interna de los servicios (`/services`) como las rutas HTTP (endpoints en `/routes`).
Al correr las pruebas, se crea automáticamente una base de datos de pruebas limpia (`database.test.sqlite`) que no afecta los datos reales del negocio.

**Correr los tests y generar reporte de cobertura:**
```bash
cd backend
npm run test:coverage
```

## Frontend

Los tests del frontend prueban el renderizado de los componentes (con `jsdom`) y las interacciones complejas de usuario (como el armado de una nueva venta en el carrito y cálculos de precios), aislando la API del backend mediante mocks (no se requiere que el backend esté ejecutándose).

**Correr los tests y generar reporte de cobertura:**
```bash
cd frontend
npm run test:coverage
```

---

> El comando `npm run test:coverage` imprimirá en la consola una tabla detallando qué porcentaje de las líneas, funciones y branches de código fueron cubiertas por los tests automatizados. También generará reportes más detallados en HTML si se desea revisarlos a fondo.
