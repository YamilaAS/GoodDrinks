# 🏛️ Documentación de Arquitectura — GoodDrinks Backend

Este documento detalla la estructura técnica, las decisiones de diseño, el flujo de datos y la estrategia de testing de la API REST de **GoodDrinks**.

---

## 1. Patrón Arquitectónico (3 Capas)

La aplicación sigue una arquitectura de tres capas para garantizar el **desacoplamiento**, la **mantenibilidad** y el principio de **Responsabilidad Única (SRP)**.

### 🔄 Flujo de la arquitectura

```text
[ Petición HTTP ]
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Controller  → Manejo de red HTTP (req, res),               │
│                validación de entrada/salida.                │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Service     → Lógica de negocio pura y orquestación        │
│                de casos de uso.                             │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Repository  → Abstracción del acceso a datos               │
│                (Mongoose / MongoDB).                        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
[ MongoDB Database ]
```

### 📦 Responsabilidades por capa

#### Controllers

**Ubicación:** `src/controllers/`

- Reciben la petición HTTP (`req`) y extraen parámetros, cuerpo o encabezados.
- Llaman a la capa de servicios.
- Retornan la respuesta HTTP con su código de estado adecuado (`res.status().json()`).
- No conocen la lógica de negocio ni la estructura interna de la base de datos.

#### Services

**Ubicación:** `src/services/`

- Contienen las reglas de negocio del sistema (ej. verificar duplicados, evaluar permisos de acción).
- Son totalmente independientes de Express y del framework web.
- Solicitan o persisten información mediante la capa de Repositorios.

#### Repositories

**Ubicación:** `src/repositories/`

- Encapsulan las consultas a MongoDB usando Mongoose.
- Emplean operadores atómicos de MongoDB (`$addToSet`, `$pull`, `$inc`) para prevenir *race conditions*.
- Si en el futuro se cambia el ODM o motor de base de datos, solo se modifica esta capa.

---

## 2. DTOs (Data Transfer Objects) y Sanitización

Los DTOs estandarizan la estructura JSON enviada al cliente y protegen la seguridad del sistema.

- **Sanitización:** filtran campos sensibles (como contraseñas hasheadas o versiones internas de Mongoose `__v`).
- **Estandarización:** garantizan un contrato de API consistente (transformando `_id` a `id` para el cliente).

---

## 3. Seguridad y Autenticación

- **Hash de Contraseñas:** encriptación automática mediante el hook `pre('save')` de Mongoose utilizando `bcryptjs`.
- **Autenticación Stateless:** basada en tokens JWT (JSON Web Tokens) transmitidos en la cabecera HTTP `Authorization: Bearer <token>`.
- **Protección de Rutas:** middleware `protect` que valida el token antes de permitir el paso al controlador.

---

## 4. Guía de Testing

El proyecto cuenta con **100% de cobertura funcional** (22/22 tests pasando en 8 suites) mediante Jest y Supertest.

### 🧪 Aislamiento y limpieza

- **Aislamiento de Entorno:** ejecutados bajo `NODE_ENV=test`.
- **Limpieza de Estado:** limpieza de colecciones (`deleteMany({})`) en hooks `beforeEach`/`afterAll` para evitar interferencias entre pruebas.

### ▶️ Ejecución de Tests

**Correr tests localmente:**

```bash
npm test
```

**Correr tests dentro del contenedor Docker:**

```bash
docker exec -it gooddrinks-backend npm test
```

---

## 5. Infraestructura y Docker

Utiliza un **Multi-Stage Build** para producción.

### 🐳 Etapas de construcción

| Etapa | Descripción |
|---|---|
| `dev` | Entorno de desarrollo interactivo y suite de pruebas. |
| `builder` | Limpieza de dependencias de desarrollo (`npm prune --omit=dev`). |
| `runner` | Imagen Alpine optimizada corriendo bajo usuario no privilegiado (`USER node`). |