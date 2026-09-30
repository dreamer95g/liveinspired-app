<div align="center">
  <h1 align="center">✨ LiveInspired — Frontend ✨</h1>
  
  <p align="center">
    <i>Aplicación web SPA desarrollada en React para la gestión de notas, frases de inspiración y categorías.</i>
    <br />
    <b>Diseñada como un proyecto de entorno local desplegado sobre servidor Laragon.</b>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite_8-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Apollo_GraphQL-311C87?style=for-the-badge&logo=apollo-graphql&logoColor=white" alt="Apollo GraphQL" />
  </p>
</div>

<hr />

<h2>👤 Autor</h2>
<ul>
  <li><b>Gabry95g</b></li>
  <li>🌐 GitHub: <a href="https://github.com/dreamer95g" target="_blank">@Gabry95g</a></li>
</ul>

<h2>🛠️ Tecnologías Usadas</h2>
<ul>
  <li><b>React 19 + Vite 8</b> — Framework y Bundler para máxima velocidad en desarrollo y compilación.</li>
  <li><b>Apollo Client</b> — Gestión de estado de la aplicación e interceptores de red para las peticiones GraphQL.</li>
  <li><b>Tailwind CSS v4</b> — Framework de estilos utilitarios moderno.</li>
  <li><b>Shadcn UI & Base UI</b> — Componentes de interfaz accesibles, minimalistas y altamente personalizables.</li>
  <li><b>TipTap</b> — Editor de texto enriquecido (Rich Text Editor) para el formato avanzado de las notas.</li>
  <li><b>React Router DOM v7</b> — Enrutamiento y protección de rutas en el cliente.</li>
  <li><b>Sonner</b> — Sistema visual de notificaciones centralizadas (Toasts).</li>
  <li><b>React To Print</b> — Lógica de generación y exportación de notas a formato PDF.</li>
</ul>

<h2>🧩 Entidades y Relaciones (Lógica de Negocio)</h2>
<blockquote>
  <p>La aplicación frontend es el cliente visual que consume la API REST/GraphQL de <b>LiveInspired Backend</b>, del cual depende completamente para su funcionamiento (conectándose mediante el puerto 4000). Se estructura en torno a las siguientes entidades conectadas a la base de datos MySQL a través de Prisma:</p>
</blockquote>
<ul>
  <li><b>User (Usuario):</b> Entidad central. Gestiona el acceso mediante autenticación JWT y posee un perfil personalizable con nombre, email y un <code>avatar</code> (el cual se guarda y elimina físicamente en el servidor).</li>
  <li><b>Note (Nota):</b> Entradas o apuntes de usuario. Contienen texto enriquecido (HTML generado por TipTap), fecha de creación, y pueden tener adjunta <b>hasta 1 imagen</b> (relación gestionada físicamente en disco y en BD). Se les pueden asignar múltiples palabras clave.</li>
  <li><b>Phrase (Frase):</b> Citas o fragmentos de inspiración. Contienen el texto exacto, el autor original de la frase y están categorizadas transversalmente.</li>
  <li><b>Tag (Palabra Clave):</b> Entidad transversal de categorización (Relación Muchos a Muchos). Una nota o frase puede tener múltiples tags, y un tag puede agrupar múltiples notas y frases, permitiendo un filtrado cruzado eficiente en las vistas de búsqueda.</li>
</ul>

<hr />

<h2>🚀 Guía de Instalación y Despliegue Local (Desde Cero)</h2>
<p>Este proyecto está diseñado para ejecutarse en una red local bajo <b>Laragon</b>. El frontend se compila y sirve como sitio estático en Laragon, mientras que el backend corre de fondo como un demonio gestionado por PM2.</p>

<h3>1. Requisitos Previos</h3>
<ul>
  <li><b>Laragon</b> instalado y corriendo (gestor de Nginx/Apache local).</li>
  <li><b>Node.js 20+</b> instalado en Windows.</li>
  <li><b>Git</b> configurado.</li>
  <li><b>PM2</b> instalado globalmente (<code>npm install -g pm2</code>).</li>
</ul>

<h3>2. Clonar el repositorio</h3>
<p>Ubicá tu terminal en la carpeta raíz de tus proyectos locales (ej. <code>C:\Dev</code> o <code>C:\laragon\www</code>).</p>
<pre><code>git clone https://github.com/dreamer95g/liveinspired-app.git
cd liveinspired-app</code></pre>

<h3>3. Instalar Dependencias del Frontend</h3>
<pre><code>npm install</code></pre>

<h3>4. Configurar Variables de Entorno</h3>
<p>Creá un archivo <code>.env</code> en la raíz del proyecto para indicarle a Vite dónde escuchar al backend:</p>
<pre><code>VITE_API_URL=http://localhost:4000</code></pre>

<h3>5. Construir para Producción (Build)</h3>
<p>Dado que usás Laragon, debés compilar el código React en archivos estáticos puros para que el servidor web los interprete:</p>
<pre><code>npm run build</code></pre>
<p>Esto generará una carpeta <code>dist/</code>. Para que Laragon lo sirva correctamente (ej. bajo el dominio <code>http://liveinspired-app.test</code>), tenés dos opciones:</p>
<ol>
  <li>Configurar un <i>Virtual Host</i> en Laragon apuntando al directorio <code>C:\Dev\liveinspired-app\dist</code>.</li>
  <li>Mover el contenido de la carpeta <code>dist</code> directamente a <code>C:\laragon\www\liveinspired-app</code>.</li>
</ol>

<h3>6. Despliegue del Backend API con PM2</h3>
<p>El frontend es inútil sin la API. Para que funcione sin tener una terminal abierta siempre, usamos PM2.</p>
<ol>
  <li>Abrí la terminal en la carpeta del backend (<code>C:\Dev\liveinspired</code>).</li>
  <li>Iniciá el servidor nombrando el proceso:<br><code>pm2 start index.js --name "liveinspired-api"</code></li>
  <li>Guardá la lista de procesos actuales de PM2:<br><code>pm2 save</code></li>
</ol>

<h3>7. Configurar Arranque Automático (Tarea Programada)</h3>
<p>Para automatizar el inicio del backend en cada encendido de la computadora, utilizamos los scripts <code>.vbs</code> y <code>.cmd</code> incluidos en el repositorio del backend.</p>
<p>El archivo <b><code>start-api.vbs</code></b> se encarga de ejecutar el comando <code>pm2 resurrect</code> a través de la shell de Windows (<code>WScript.Shell</code>) de forma completamente silenciosa (<code>0, False</code>), evitando que aparezcan ventanas negras de CMD.</p>
<ol>
  <li>Abrí el <b>Programador de tareas</b> de Windows.</li>
  <li>Clic en <b>Crear tarea básica...</b></li>
  <li><b>Nombre:</b> <code>Start LiveInspired API</code>.</li>
  <li><b>Desencadenador:</b> Elegí "Al iniciar sesión".</li>
  <li><b>Acción:</b> Iniciar un programa.</li>
  <li><b>Programa/script:</b> <code>wscript.exe</code></li>
  <li><b>Agregar argumentos:</b> <code>"C:\Dev\liveinspired\start-api.vbs"</code> (Asegurate de que apunte a la ruta real de tu proyecto).</li>
  <li>Aceptá y guardá.</li>
</ol>

<br/>
<p align="center">
  <b>¡Listo!</b> Con esto configurado, cada vez que enciendas la computadora, el frontend estará disponible en tu URL local de Laragon de forma inmediata, y la API se levantará de fondo en el puerto 4000 lista para recibir tus Notas y Frases.
</p>