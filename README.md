# Mini ERP: gestión administrativa y fiscal

Aplicación con arquitectura **Frontend – API REST – Middlewares – Base de datos**.

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript |
| API | Node.js + Express |
| Base de datos | MySQL |
| Pruebas | Postman |

## Estructura
cat > backend/.env.example << 'EOF'
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=LEON2977
DB_NAME=mini_erp
JWT_SECRET=LEON2977
