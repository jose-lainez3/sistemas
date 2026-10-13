# Sistema Escolar Nova

Version renovada del sistema de gestion escolar original: mismos datos y
funcionalidad (alumnos, matricula, asistencia, notas, cursos, usuarios,
reportes PDF/Excel), pero con:

- **Backend:** Node.js puro (sin PHP)
- **Base de datos:** SQLite (un solo archivo, sin instalar MySQL ni usar phpMyAdmin)
- **Estilo visual:** tema oscuro moderno, distinto al original
- **Cero dependencias externas:** no necesita `npm install`. Todo (servidor
  HTTP, plantillas, hash de contrasenas, generador de PDF y de Excel) esta
  escrito con los modulos nativos de Node.js.

## 1. Requisito unico

**Node.js version 22 o superior** (usa el modulo nativo `node:sqlite`,
disponible desde Node 22).

Verifica tu version:
```bash
node -v
```
Si es menor a 22, descarga la ultima version LTS desde https://nodejs.org

## 2. Levantar el sistema

No hay que instalar nada. Desde la carpeta del proyecto:

```bash
node app.js
```

Deberias ver:
```
  Sistema Escolar Nova corriendo
  -> http://localhost:3000
  Admin de prueba: admin@escuela.com / Admin123!
```

La primera vez que arranca, crea automaticamente el archivo
`data/escuela.db` con todas las tablas y estos datos iniciales (igual
que el sistema original):

- **Admin:** `admin@escuela.com` / `Admin123!`
- **Curso de ejemplo:** "1ro Basico A" (ano actual)

Abre tu navegador en:
```
http://localhost:3000
```

Para detenerlo, presiona `Ctrl + C` en la terminal.

## 3. Cambiar el puerto (opcional)

Por defecto usa el puerto 3000. Para usar otro:
```bash
PORT=8080 node app.js
```
(En Windows/PowerShell: `$env:PORT=8080; node app.js`)

## 4. Roles de usuario (igual que el sistema original)

| Rol         | Puede hacer |
|-------------|-------------|
| **admin**       | Todo: usuarios, cursos, alumnos, matriculas, asistencia, notas, reportes |
| **secretaria**  | Registrar alumnos, matricularlos, ver reportes |
| **profesor**    | Marcar asistencia y notas **solo de sus cursos asignados**, ver esos reportes |

El administrador crea usuarios desde el menu **"Usuarios"** y asigna
profesores a cursos desde **"Cursos"**.

## 5. Flujo de uso normal

1. **Admin** crea los cursos del ano y las cuentas de secretaria/profesores,
   asignando cada profesor a sus cursos.
2. **Secretaria** registra alumnos y los matricula en un curso. La
   asistencia y notas solo se pueden registrar para matriculas **activas**.
3. **Profesor** marca asistencia dia a dia e ingresa notas por materia y
   periodo, solo en sus cursos asignados.
4. Cualquiera con acceso puede ir a **"Reportes"** y exportar en **PDF**
   o **Excel (.xlsx)**: listado de alumnos, asistencia por rango de
   fechas, o notas por materia/periodo.

## 6. Estructura de archivos

```
sistema_escolar_nuevo/
├── app.js                    -> punto de entrada (node app.js)
├── db/
│   ├── schema.sql             -> esquema SQLite (se aplica solo al arrancar)
│   ├── database.js            -> conexion a data/escuela.db
│   └── seed.js                -> crea el admin y curso de ejemplo
├── lib/
│   ├── servidor.js             -> mini framework HTTP (rutas, sesiones, body parsing)
│   ├── sesiones.js             -> sesiones basadas en cookie
│   ├── auth.js                 -> control de login y roles
│   ├── passwords.js            -> hash/verificacion de contrasenas (scrypt)
│   ├── plantillas.js           -> motor de plantillas HTML
│   ├── pdf_writer.js           -> generador de PDF propio
│   ├── xlsx_writer.js          -> generador de Excel propio
│   ├── zip_writer.js           -> empaquetador ZIP (usado por el xlsx)
│   └── form_arrays.js          -> soporte para campos tipo array[] en formularios
├── routes/                    -> una ruta por modulo (alumnos, matricula, etc.)
├── views/                     -> plantillas HTML de cada pagina
├── public/css/estilo.css      -> estilos (tema oscuro)
└── data/escuela.db            -> base de datos SQLite (se crea sola)
```

## 7. Diferencias clave respecto al sistema original

| Aspecto | Original | Nova |
|---|---|---|
| Backend | PHP | Node.js (nativo, sin frameworks) |
| Base de datos | MySQL (phpMyAdmin) | SQLite (un solo archivo) |
| Instalacion | Copiar a `htdocs/`, importar SQL, configurar `database.php` | `node app.js` y listo |
| Estilo | Claro, clasico | Oscuro, tipo panel de control |
| Datos y flujos | — | Identicos (mismos roles, mismas reglas de negocio) |

## 8. Seguridad incluida

- Contrasenas con hash `scrypt` + salt (nunca en texto plano).
- Consultas SQL parametrizadas (sin concatenar strings), evitando inyeccion SQL.
- Verificacion de rol en cada ruta.
- Un profesor solo puede ver/exportar reportes de sus cursos asignados
  (verificado en el servidor, no solo ocultando el boton).
- Asistencia y notas solo aplican a matriculas con estado **activo**.

## 9. Personalizacion rapida

- Cambiar el nombre "Escolar Nova": edita `views/partials/encabezado.html`,
  `views/login.html` y el `<title>` en `lib/plantillas.js` si quieres.
- Cambiar colores: edita las variables al inicio de
  `public/css/estilo.css` (bloque `:root`).
- Cambiar puerto por defecto: variable `PORT` (ver seccion 3).

---
Sistema probado end-to-end (login, alumnos, matricula, asistencia, notas,
cursos, usuarios, exportacion PDF/Excel real y permisos por rol) antes
de la entrega.
