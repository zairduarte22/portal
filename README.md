# Portal Administrativo

Sistema integral para la gestión de membresías, control de cuotas, facturación, conciliación bancaria y tiendas (tasca/bar). Construido con Laravel, React y PostgreSQL, ofrece un panel administrativo robusto y escalable diseñado para un control financiero detallado.

## Características Principales

- **Gestión de Miembros y Carnets**: Registro, control de solvencias y emisión de carnets.
- **Facturación y Cuotas**: Generación automática de obligaciones, abonos y control de deudas.
- **Conciliación Bancaria**: Tracking completo de ingresos, egresos y cruces contables entre distintas monedas.
- **Módulo de Tiendas (Tasca/Bar)**: Control de inventario, ventas y cierres de caja.
- **Multimoneda**: Soporte para operaciones cruzadas (VES / USD) con cálculos de tasa de cambio dinámicos.

## Requisitos del Sistema

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **NPM** >= 9.x
- **PostgreSQL** >= 14.x

## Guía de Instalación

Sigue estos pasos para instalar y ejecutar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Instalar Dependencias

Instala las dependencias de PHP y JavaScript:

```bash
composer install
npm install
```

### 3. Configurar el Entorno

Copia el archivo de configuración base y genera tu clave de aplicación:

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configurar la Base de Datos (PostgreSQL)

Crea una base de datos vacía en tu servidor PostgreSQL.
Luego, abre el archivo `.env` que acabas de crear y ajusta las credenciales:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=nombre_de_tu_bd
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 5. Construir la Base de Datos Inicial

Este proyecto utiliza un esquema compactado (`schema dump`) para facilitar la instalación limpia. No verás cientos de migraciones antiguas, solo ejecuta:

```bash
php artisan migrate --seed
```

> **Nota:** El comando `--seed` poblará la base de datos con las configuraciones básicas y creará un usuario administrador por defecto:
> - **Email:** `admin@admin.com`
> - **Contraseña:** `password`

### 6. Compilar Assets y Levantar el Servidor

Finalmente, compila el código React (Frontend) y levanta el servidor de desarrollo (Backend):

Abre una terminal para compilar el frontend:
```bash
npm run dev
```

En otra terminal, levanta el backend:
```bash
php artisan serve
```

¡Listo! Ya puedes ingresar al portal a través de `http://127.0.0.1:8000` e iniciar sesión.
