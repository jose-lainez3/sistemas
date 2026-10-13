const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth_routes');
const alumnosRoutes = require('./routes/alumnos_routes');
const cursosRoutes = require('./routes/cursos_routes');
const matriculaRoutes = require('./routes/matricula_routes');
const categoriasRoutes = require('./routes/categorias_routes');
const inventarioRoutes = require('./routes/inventario_routes');
const asistenciaRoutes = require('./routes/asistencia_routes');
const notasRoutes = require('./routes/notas_routes');
const reportesRoutes = require('./routes/reportes_routes');

const app = express();

// --- MIDDLEWARES IMPORTANTES ---

// Habilitamos CORS para permitir peticiones desde Ionic
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Para que Express entienda los datos JSON que enviará Ionic
app.use(express.json());
// Para que Express entienda datos de formularios (URL-encoded)
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE LA API ---

app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/matricula', matriculaRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/reportes', reportesRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en el puerto ${PORT}`);
});
