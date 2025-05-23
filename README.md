# 🎸 SoundNest – Tienda de instrumentos musicales

SoundNest es una tienda online full-stack desarrollada como proyecto personal con enfoque MVP. Permite navegar por productos, filtrarlos, registrarse, iniciar sesión, agregar productos al carrito y realizar compras. Incluye funcionalidades clave como autenticación, persistencia, validación de stock y más.

## 🚀 Deploy online

🔗 [https://soundnest-musicstore-git-main-alefalces-projects.vercel.app](https://soundnest-musicstore-git-main-alefalces-projects.vercel.app)

## 🛠️ Tecnologías utilizadas

### Frontend

- TypeScript
- Next.js
- TailwindCSS
- SweetAlert2
- React Toastify
- Lucide React Icons

### Backend

- Node.js
- Express
- PostgreSQL
- TypeORM
- JWT para autenticación
- Bcrypt para hasheo de contraseñas

## 🔐 Funcionalidades principales

- Autenticación de usuarios con JWT
- Registro e inicio de sesión
- Carrito persistente con LocalStorage
- Validación de stock
- Protección de rutas privadas
- Historial de órdenes básico
- Filtros por nombre y categoría
- Confirmaciones con SweetAlert2
- Responsive Design

## 📦 Instalación local

1. Cloná este repositorio:
   git clone https://github.com/AleFalces/E-comerce.git

2. Instalá las dependencias:
   npm install

3. Configurá las variables de entorno. Renombrá .env.example a .env y completá los valores correspondientes:
   Encontraras un archivo.env.exaple en la carpeta front y en la carpeta back respetcivamente.

4. Inicializá la base de datos (asegurate de tener PostgreSQL corriendo):
   npm run typeorm migration:run

5. Ejecutá el servidor de desarrollo:
   Front: npm run dev
   Back: npm start

## 📦 Futuras mejoras

- Integración con pasarela de pago
- Administración avanzada de órdenes
- Testing automatizado (unitarios y de integración)
- Mejoras en el dashboard de usuarios
