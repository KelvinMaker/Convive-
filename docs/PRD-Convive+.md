# PRD — Convive+

**Documento de requisitos del producto**

| Campo | Valor |
| --- | --- |
| Producto | Convive+ |
| Versión del documento | 1.0 |
| Fecha | 29 de septiembre de 2026 |
| Estado | Vigente. Describe el producto tal como está construido. |
| Idioma de la aplicación | Español |
| Audiencia | Equipo de producto, docentes, desarrollo y quienes vayan a extender la app |

Este PRD fija qué hace Convive+, para quién, con qué reglas y con qué criterios se considera cumplido. Cuando un requisito del diseño original no está activo, se marca como **Previsto** para no confundirlo con el comportamiento real.

---

## 1. Resumen ejecutivo

Convive+ es una aplicación web escolar para practicar el manual de convivencia y observar los resultados. La persona entra sin correo ni contraseña: escribe un nombre, que es opcional. Si no lo escribe, el sistema la identifica como **JUGADOR 1**.

El uso principal es una trivia de 10 preguntas tomadas al azar de un banco de 98 situaciones. Al terminar, el puntaje se guarda con ese nombre. Un panel muestra partidas jugadas, promedio, últimas partidas, distribución de puntajes y permite descargar el historial en CSV. Una segunda pantalla convierte ese CSV en gráficos de rendimiento y de actividad por día.

Sigue existiendo un módulo para registrar conflictos o logros, listarlos, cerrarlos y eliminarlos. La pantalla de inicio ofrece dos entradas: **Ir a Jugar** y **Ir a Reportes**. Reportes abre el panel de la trivia, no el listado de incidentes. El listado de incidentes se alcanza por su propia ruta.

La identidad dura mientras la pestaña del navegador siga abierta. No hay cuentas, roles ni recuperación de contraseña.

---

## 2. Problema y oportunidad

En la convivencia escolar, el manual existe, pero pocas veces se practica de forma breve, repetible y medible. Un cuestionario en papel no guarda el historial ni muestra en el momento si la respuesta fue correcta.

Convive+ convierte situaciones del manual en una partida corta, guarda el resultado y lo deja visible para quien acompaña al grupo. El registro de incidentes cubre el otro lado del mismo tema: dejar constancia de un conflicto o de un logro, con una fecha de vencimiento y la posibilidad de cerrarlo con una observación.

---

## 3. Visión y objetivos

### 3.1 Visión

Cualquier estudiante o docente puede, en un celular, practicar el manual de convivencia en menos de una partida y dejar un rastro del resultado, sin crear una cuenta.

### 3.2 Objetivos del producto vigente

1. Entrar en un solo paso, con nombre opcional.
2. Jugar 10 situaciones al azar, con retroalimentación inmediata.
3. Guardar cada partida terminada a nombre de quien juega.
4. Ver el conjunto de resultados y exportarlos.
5. Registrar, consultar, cerrar y eliminar reportes de convivencia.

### 3.3 Objetivos que el diseño original contemplaba y hoy no están activos

- Cuentas con correo, contraseña y roles (estudiante, docente, directivo).
- Grupos de usuarios que compartan los mismos registros.
- Invitaciones para altas controladas.
- Resúmenes escritos por un modelo de lenguaje a partir de los reportes.
- Panel de incidentes en tiempo real (cantidad por tipo, grupos más afectados).

Esas piezas quedan descritas en la sección 16 como trabajo previsto, no como comportamiento actual.

---

## 4. Usuarios

No hay perfiles con permisos distintos. Quien entra puede jugar, ver el panel, pegar un CSV y usar el módulo de incidentes.

| Quién | Qué necesita | Cómo entra |
| --- | --- | --- |
| Estudiante | Practicar el manual y ver su puntaje | Nombre opcional |
| Docente o acompañante | Ver resultados del grupo y exportarlos | El mismo formulario de nombre |
| Quien reporta un hecho | Dejar un conflicto o un logro, identificado o anónimo | El mismo formulario de nombre |

El nombre no se verifica. Dos personas pueden escribir el mismo nombre. El sistema no distingue si “Ana” de hoy es la misma “Ana” de ayer, salvo que la pestaña no se haya cerrado.

### 4.1 Identidad

| Regla | Detalle |
| --- | --- |
| Campo | Nombre, opcional, máximo 40 caracteres |
| Vacío o solo espacios | Se guarda **JUGADOR 1** |
| Dónde se pide | Pantalla de bienvenida, antes de los módulos |
| Dónde se recuerda | `sessionStorage` del navegador, clave `convive-player-name` |
| Cuándo se olvida | Al cerrar la pestaña o la sesión del navegador, o al pulsar **Cambiar nombre** |
| Cambiar nombre | Borra el nombre, vuelve al inicio y muestra de nuevo el formulario |

Las rutas antiguas `/login`, `/register` y `/setup-admin` redirigen al inicio. No muestran formulario de correo ni de contraseña.

Si alguien abre `/trivia`, `/reports`, `/summaries` o una ruta de incidentes sin haber confirmado el nombre, vuelve al inicio.

---

## 5. Alcance

### 5.1 Dentro del producto vigente

- Bienvenida con logo y nombre opcional.
- Trivia de 10 preguntas, feedback y puntaje.
- Persistencia del resultado de cada partida terminada.
- Panel de monitoreo de la trivia.
- Descarga CSV del historial.
- Gráficos a partir de un CSV pegado.
- Alta, listado, cierre y eliminación de incidentes.
- Logo de Convive+ en cabecera, bienvenida e icono de la pestaña.

### 5.2 Fuera del alcance vigente

- Correo, contraseña, roles y administrador inicial.
- Perfil y configuración de cuenta.
- Grupos e invitaciones.
- Texto generado por IA en la pantalla de resúmenes.
- Edición de un incidente ya creado.
- Varios idiomas.
- Aplicación nativa iOS o Android.
- Notificaciones push, correo o mensajería.
- Banco de preguntas editable desde la interfaz.

---

## 6. Mapa de la aplicación

```text
Bienvenida (nombre opcional)
        |
        +-- Trivia
        |     inicio de partida -> pregunta 1..10 -> resultado
        |
        +-- Panel de reportes (métricas de trivia)
              |
              +-- Resúmenes (pegar CSV y ver gráficos)

Rutas de incidentes, no enlazadas desde la bienvenida:
  /incidents/new
  /incidents/list
  /incidents/close
```

| Ruta | Pantalla | Acceso |
| --- | --- | --- |
| `/` | Bienvenida o menú de módulos | Pública para elegir nombre. Con nombre, muestra los dos módulos |
| `/trivia` | Trivia | Requiere nombre |
| `/reports` | Panel de monitoreo | Requiere nombre |
| `/summaries` | Gráficos del CSV | Requiere nombre |
| `/incidents/new` | Registrar incidente | Requiere nombre |
| `/incidents/list` | Listado | Requiere nombre |
| `/incidents/close` | Cerrar incidente | Requiere nombre |
| `/login`, `/register`, `/setup-admin` | Redirección al inicio | No hay formulario |

La cabecera está en todas las pantallas. Muestra el logo, el nombre actual y **Cambiar nombre**. El logo enlaza al inicio.

---

## 7. Flujos

### 7.1 Entrar

1. La persona abre la aplicación.
2. Ve el logo, el título “Bienvenido a Convive+” y el texto que explica que, si deja el nombre vacío, entrará como JUGADOR 1.
3. Puede escribir un nombre o dejar el campo en blanco.
4. Pulsa **Entrar**.
5. Llega al menú con el saludo “Hola, {nombre}” y dos tarjetas: Trivia y Reportes.

### 7.2 Jugar

1. Pulsa **Ir a Jugar**.
2. Lee la introducción: se elegirán 10 preguntas al azar.
3. Pulsa **JUGAR**.
4. Responde cada pregunta. Durante 1,5 segundos ve si acertó.
5. Al terminar la décima, ve el puntaje, un mensaje según el resultado y dos acciones: **Volver a Jugar** o **Terminar**.
6. El sistema intenta guardar la partida. Si el guardado falla, la partida igual muestra el resultado en pantalla.

### 7.3 Consultar y exportar

1. Desde el inicio pulsa **Ir a Reportes**.
2. Ve el saludo según la hora, el total de partidas, el promedio, las últimas cinco y el gráfico de puntajes de 0 a 10.
3. Puede descargar `resultados_trivia.csv`.
4. Puede abrir **Resúmenes IA**, pegar ese CSV y generar los gráficos.

### 7.4 Reportar un incidente

1. Entra a `/incidents/new` (no hay botón en la bienvenida).
2. Elige categoría, tipo específico, descripción, si es conflicto o logro, y si el reporte es anónimo.
3. Envía. Si no es anónimo, el reporte queda a nombre de quien entró.
4. Vuelve al inicio.

### 7.5 Cerrar o eliminar

1. En `/incidents/list` ve la tabla y puede eliminar un registro.
2. En `/incidents/close` elige un incidente abierto, escribe una observación de al menos 10 caracteres y lo archiva.
3. Cualquier persona que haya entrado con un nombre puede cerrar o eliminar. No hay un rol de directivo que lo restrinja.

---

## 8. Requisitos funcionales

Estado: **Implementado** significa que la aplicación lo hace hoy.

### 8.1 Identidad y navegación

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-001 | La aplicación no pide correo ni contraseña. | Implementado |
| RF-002 | Pide un nombre opcional antes de mostrar los módulos. | Implementado |
| RF-003 | Si el nombre está vacío o solo tiene espacios, usa el texto exacto `JUGADOR 1`. | Implementado |
| RF-004 | Recorta el nombre a 40 caracteres. | Implementado |
| RF-005 | Conserva el nombre en la sesión de la pestaña. | Implementado |
| RF-006 | **Cambiar nombre** borra la sesión y vuelve al formulario. | Implementado |
| RF-007 | Sin nombre, cualquier ruta distinta de `/` redirige al inicio. | Implementado |
| RF-008 | `/login`, `/register` y `/setup-admin` redirigen a `/`. | Implementado |
| RF-009 | La cabecera muestra logo, nombre y acción para cambiarlo. | Implementado |
| RF-010 | El logo de la cabecera lleva al inicio. | Implementado |

### 8.2 Inicio

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-020 | Con nombre confirmado, el inicio saluda con ese nombre. | Implementado |
| RF-021 | Ofrece **Módulo de Trivia** con botón **Ir a Jugar**. | Implementado |
| RF-022 | Ofrece **Módulo de Reportes** con botón **Ir a Reportes**, que abre el panel de trivia. | Implementado |
| RF-023 | El texto de apoyo describe convivencia escolar, incidentes y aprendizaje. | Implementado |

### 8.3 Trivia

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-030 | Antes de empezar, explica que habrá 10 preguntas al azar. | Implementado |
| RF-031 | Cada partida toma 10 ítems distintos del banco, en orden aleatorio. | Implementado |
| RF-032 | Cada ítem tiene un enunciado y tres opciones. El orden de las opciones también se baraja. | Implementado |
| RF-033 | Muestra “Pregunta n de 10” y una barra de avance. | Implementado |
| RF-034 | Solo se puede responder una vez por pregunta. | Implementado |
| RF-035 | Si la opción es correcta, se suma 1 punto y el botón se muestra en verde con un visto. | Implementado |
| RF-036 | Si la opción es incorrecta, esa opción se muestra en rojo y la correcta en verde. | Implementado |
| RF-037 | La siguiente pregunta aparece a los 1,5 segundos. | Implementado |
| RF-038 | Al final muestra el puntaje como `aciertos/10` y un mensaje según el porcentaje. | Implementado |
| RF-039 | 100 %: “¡Excelente! Eres un experto en convivencia.” | Implementado |
| RF-040 | 70 % a 99 %: “¡Muy bien hecho! Tienes un gran conocimiento del manual.” | Implementado |
| RF-041 | 50 % a 69 %: “Buen trabajo. Sigue aprendiendo para mejorar.” | Implementado |
| RF-042 | Menos de 50 %: “Necesitas repasar el manual. ¡No te rindas!” | Implementado |
| RF-043 | **Volver a Jugar** arma una partida nueva. **Terminar** vuelve al inicio. | Implementado |
| RF-044 | Al terminar se guarda: nombre, puntaje, total de preguntas (10) y fecha en ISO. | Implementado |
| RF-045 | El guardado no bloquea la pantalla de resultado si el servidor falla. | Implementado |
| RF-046 | No se guarda una partida abandonada a medias. | Implementado |
| RF-047 | Desde el inicio de la trivia se puede volver al inicio sin jugar. | Implementado |

### 8.4 Panel de monitoreo

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-050 | Saluda según la hora: “Buenos días” antes de las 12, “Buenas tardes” antes de las 18, “Buenas noches” después. | Implementado |
| RF-051 | Incluye el nombre de quien está en la sesión. | Implementado |
| RF-052 | Muestra el total de partidas guardadas. | Implementado |
| RF-053 | Muestra el puntaje promedio con un decimal, sobre 10. Si no hay partidas, el promedio es 0. | Implementado |
| RF-054 | Esas dos métricas enlazan a la trivia. | Implementado |
| RF-055 | Lista las últimas 5 partidas: nombre, fecha en español y puntaje sobre el total. | Implementado |
| RF-056 | Si no hay partidas, invita a jugar. | Implementado |
| RF-057 | Gráfico de barras: eje horizontal puntaje 0 a 10, eje vertical número de partidas. | Implementado |
| RF-058 | Enlace a Resúmenes, visible para cualquier persona que haya entrado. | Implementado |
| RF-059 | El panel carga los incidentes, pero no los muestra. | Implementado (deuda: la carga no tiene efecto visible) |

### 8.5 Exportación CSV

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-060 | Botón **Descargar Historial de Trivia**, desactivado si no hay resultados. | Implementado |
| RF-061 | Archivo `resultados_trivia.csv`, codificación UTF-8. | Implementado |
| RF-062 | Columnas: `Usuario`, `Puntaje`, `Total Preguntas`, `Fecha`. | Implementado |
| RF-063 | La fecha se exporta como `dd/MM/yyyy HH:mm:ss`. | Implementado |
| RF-064 | El nombre va entre comillas y las comillas internas se duplican. | Implementado |
| RF-065 | El archivo incluye todo el historial, no solo las últimas cinco. | Implementado |
| RF-066 | El orden del CSV es del más antiguo al más reciente. | Implementado |

### 8.6 Resúmenes y gráficos

La pantalla se llama “Análisis de Resultados de Trivia” y en el panel el botón dice “Resúmenes IA”. Los gráficos se calculan en el navegador. No llaman al modelo de lenguaje.

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-070 | Hay un área de texto para pegar el CSV, incluida la fila de encabezados. | Implementado |
| RF-071 | Si el área está vacía, se avisa y no se generan gráficos. | Implementado |
| RF-072 | Se ignoran filas con menos de 4 columnas. | Implementado |
| RF-073 | El puntaje es la segunda columna. Se clasifica así: Excelente 8–10, Bueno 6–7, A mejorar 0–5. | Implementado |
| RF-074 | La fecha es la cuarta columna, formato `dd/MM/yyyy HH:mm:ss`. Se agrupa por día (`dd MMM`). | Implementado |
| RF-075 | Se muestra un gráfico circular de rendimiento y uno de barras de partidas por día. | Implementado |
| RF-076 | Si el texto no produce datos válidos, se muestra un error. | Implementado |
| RF-077 | La generación espera cerca de 1 segundo antes de dibujar, sin consultar un servicio de IA. | Implementado |
| RF-078 | Un flujo de Genkit puede resumir texto de resultados con Gemini, pero ninguna pantalla lo invoca. | Previsto, no conectado |

### 8.7 Incidentes

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-080 | Se puede registrar un incidente con categoría, tipo específico, descripción, tipo de reporte y anonimato. | Implementado |
| RF-081 | La categoría y el tipo salen de un catálogo fijo. Al cambiar de categoría se limpia el tipo. | Implementado |
| RF-082 | La descripción tiene entre 10 y 1000 caracteres. | Implementado |
| RF-083 | El tipo de reporte es `conflicto` o `logro`. | Implementado |
| RF-084 | Si no es anónimo, se guardan el nombre de la sesión como autor y como identificador. | Implementado |
| RF-085 | Si es anónimo, el autor queda como anónimo y no se usa el nombre de la sesión. | Implementado |
| RF-086 | Al crearse, el estado es `open`. La fecha de vencimiento es 30 días después de la creación. | Implementado |
| RF-087 | Tras guardar, se vuelve al inicio. | Implementado |
| RF-088 | El listado muestra título, tipo, estado, fecha, vencimiento, quién reportó y el rol guardado. | Implementado |
| RF-089 | El listado permite eliminar cualquier incidente. | Implementado |
| RF-090 | La acción “editar” del listado no abre un formulario de edición. | Parcial |
| RF-091 | Cerrar exige un incidente abierto y una observación de 10 a 1000 caracteres. | Implementado |
| RF-092 | Al cerrar se guardan estado `closed`, observación, fecha y el nombre de quien cierra. | Implementado |
| RF-093 | No se puede cerrar dos veces el mismo incidente. | Implementado |
| RF-094 | Tras cerrar, se vuelve al panel de reportes. | Implementado |
| RF-095 | No hay enlace a incidentes desde la bienvenida ni desde el panel. | Implementado (hueco de navegación) |
| RF-096 | Grupos de usuarios asociados a un incidente. | Previsto |
| RF-097 | El vencimiento a 30 días se muestra, pero no archiva ni oculta el incidente al cumplirse. | Parcial |

### 8.8 Catálogo de incidentes

Cada registro usa una de estas categorías y, dentro de ella, un tipo específico.

| Categoría | Tipos |
| --- | --- |
| Conflicto entre estudiantes | Discusiones; peleas verbales o físicas; burlas; apodos ofensivos; exclusión social |
| Acoso escolar o bullying | Intimidación; amenazas; hostigamiento físico; verbal; digital (ciberacoso) |
| Faltas de respeto a docentes o personal | Respuestas groseras; desobediencia; interrupciones en clase |
| Vandalismo | Infraestructura; pupitres; baños; paredes; materiales escolares |
| Robo o hurto | Objetos de compañeros; objetos de la institución |
| Discriminación | Género; raza; religión; orientación sexual; discapacidad; comentarios generales |
| Consumo de sustancias | Cigarrillos; alcohol; drogas |
| Fugas o ausencias | Salir sin permiso; faltar sin justificación |
| Desobediencia a normas | Reglamento; uniforme; objetos prohibidos |
| Acoso sexual o comentarios inapropiados | Insinuaciones; tocamientos; gestos; palabras |
| Dispositivos electrónicos | Grabar o fotografiar sin consentimiento; difundir información; distracción en clase |
| Riñas o peleas | Dentro del plantel; fuera del plantel, ligadas a la convivencia |
| Amenazas o extorsión | Exigir dinero; exigir objetos |
| Rumores o calumnias | Afectar la reputación de otros |

---

## 9. Reglas de negocio

1. Una partida cuenta solo si llega a la pregunta 10 y se dispara el guardado.
2. El puntaje es un entero de 0 a 10. Cada acierto suma 1. No hay puntaje parcial ni tiempo límite.
3. El banco no se edita en la aplicación. Cambiar preguntas implica editar `data/trivia.json`.
4. El promedio del panel es la media aritmética de los puntajes guardados, no del porcentaje.
5. Las bandas de la pantalla final (50 %, 70 %, 100 %) no son las mismas que las del gráfico de resúmenes (0–5, 6–7, 8–10). Las dos conviven.
6. El nombre de la partida es el de la sesión en el momento de terminar. Cambiar el nombre después no reescribe partidas ya guardadas.
7. Varias partidas del mismo nombre se acumulan. No hay límite diario.
8. Un incidente anónimo no lleva el nombre de la sesión.
9. Cerrar un incidente no lo borra. Eliminar sí lo borra del archivo, sin papelera.
10. Quien entra puede eliminar y cerrar. No hay separación entre quien reporta y quien archiva.

---

## 10. Contenido de la trivia

Cada ítem del banco tiene:

| Campo | Significado |
| --- | --- |
| `id` | Número del ítem |
| `situacion_pregunta` | Enunciado |
| `opcion_a`, `opcion_b`, `opcion_c` | Textos de respuesta |
| `correcta` | Cuál de las tres es la correcta (`opcion_a`, `opcion_b` u `opcion_c`) |

El banco vigente tiene **98** situaciones, en español, sobre deberes, derechos y convivencia. La partida no recorre el banco entero: sortea 10. La misma persona puede ver ítems distintos en cada partida y también puede repetir ítems entre partidas.

No hay explicación extendida después de la respuesta: el feedback es visual (verde o rojo) y, al final, una de las cuatro frases de la sección 8.3.

---

## 11. Modelo de datos

Los datos viven en archivos JSON en la carpeta `data/`, en el servidor. No hay base de datos en el flujo vigente.

### 11.1 Resultado de trivia — `data/trivia_results.json`

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `id` | texto | Sí | `trivia-` más la marca de tiempo |
| `userId` | texto | No | Hoy la trivia no lo envía |
| `userName` | texto | Sí | Nombre de la sesión, o `JUGADOR 1` |
| `score` | número | Sí | Aciertos |
| `totalQuestions` | número | Sí | Siempre 10 en el juego actual |
| `playedAt` | fecha ISO | Sí | Momento del guardado |

### 11.2 Preguntas — `data/trivia.json`

Arreglo de ítems descritos en la sección 10. Lo lee el cliente al armar la partida.

### 11.3 Incidente — `data/incidents.json`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | texto | Marca de tiempo |
| `title` | texto | Tipo específico elegido |
| `description` | texto | 10 a 1000 caracteres |
| `type` | `conflicto` \| `logro` | |
| `isAnonymous` | booleano | |
| `date` | fecha ISO | Creación |
| `expiresAt` | fecha ISO | Creación más 30 días |
| `reportedBy` | texto | `anonimo`, el nombre, o `desconocido` |
| `userId` | texto | Opcional. En anónimo no se guarda |
| `userName` | texto | Nombre o “Anónimo” |
| `userRole` | texto | Opcional. En anónimo, `anonimo` |
| `status` | `open` \| `closed` | |
| `closingObservation` | texto | Solo al cerrar |
| `closedAt` | fecha ISO | Solo al cerrar |
| `closedBy` | texto | Nombre de quien cierra |
| `group` | texto | Previsto. El formulario no lo envía |

### 11.4 Usuarios — `data/users.json`

Archivo heredado del acceso por correo y contraseña. **El producto vigente no lo usa para entrar.** Sigue en el disco y puede contener contraseñas en texto plano de cuentas antiguas. No forma parte del flujo de nombre.

Tipos definidos y no usados por ninguna pantalla: `Group` (grupos) e `Invitation` (invitaciones).

### 11.5 Escritura

Cada alta lee el archivo completo, agrega el registro y vuelve a escribir el JSON. No hay bloqueo entre dos guardados simultáneos. En un hosting con disco efímero, estos archivos no sobreviven a un reinicio del servidor.

---

## 12. Interfaz

### 12.1 Identidad visual

| Elemento | Definición |
| --- | --- |
| Nombre | Convive+ |
| Logo | Imagen circular con estudiantes, el manual, la trivia, gráficos y la palabra CONVIVE+. Archivo `public/convive-logo.jpg` |
| Uso del logo | Cabecera (pequeño), bienvenida y menú (grande), icono del sitio |
| Tipografía | PT Sans |
| Color primario de la guía | Azul `#5DADE2` |
| Fondo de la guía | Azul muy claro `#EBF5FB` |
| Acento de la guía | Naranja `#F39C12` |
| Componentes | ShadCN y Tailwind |
| Gráficos | Recharts |
| Iconos de acciones | Lucide |
| Enfoque | Mobile first. El menú y la trivia se leen en una columna, con ancho cómodo en teléfono |

### 12.2 Cabecera

Barra fija arriba. A la izquierda, el logo. A la derecha, el nombre truncado si es largo y el botón **Cambiar nombre**. En la bienvenida, antes de entrar, solo se ve el logo.

### 12.3 Mensajes

Los errores de formulario y de servidor se muestran en la propia pantalla o en un aviso breve (toast). Los textos de la interfaz están en español.

### 12.4 Vacíos y carga

- Sin partidas: el panel lo dice y enlaza a jugar. El botón de CSV queda desactivado.
- Mientras cargan los datos del panel o el listado de incidentes, se muestra un indicador de carga.
- Al abrir la app, mientras se lee el nombre guardado, se muestra “Cargando aplicación...”.

---

## 13. Requisitos no funcionales

| ID | Requisito | Situación actual |
| --- | --- | --- |
| RNF-001 | Usable en el navegador de un teléfono, sin instalar nada. | Cumplido en el diseño de las pantallas principales |
| RNF-002 | La partida de 10 preguntas se recorre sin recargar la página. | Cumplido. El estado del juego vive en el cliente |
| RNF-003 | Recargar la página a mitad de una partida pierde esa partida. | Así se comporta. No es un requisito deseado; es una limitación |
| RNF-004 | El nombre sobrevive a navegar entre pantallas de la misma pestaña. | Cumplido, vía `sessionStorage` |
| RNF-005 | El historial sobrevive a cerrar el navegador. | Solo si el proceso del servidor sigue escribiendo en el mismo disco |
| RNF-006 | Dos guardados a la vez no se pisan. | No garantizado |
| RNF-007 | El acceso no depende de una cuenta. | Cumplido |
| RNF-008 | Los datos de convivencia no quedan expuestos a quien no deba verlos. | No cumplido: quien entra ve todo el historial y puede borrar incidentes |
| RNF-009 | Las contraseñas antiguas no deben permanecer en el repositorio. | No cumplido: `data/users.json` sigue en el proyecto y no está ignorado por git |
| RNF-010 | Idioma de la interfaz: español. | Cumplido |

---

## 14. Arquitectura

| Capa | Elección |
| --- | --- |
| Aplicación | Next.js 15 (App Router), React 18, TypeScript |
| Servidor de desarrollo | `npm run dev`, puerto 9002 |
| Estilos | Tailwind CSS y componentes ShadCN (Radix) |
| Validación de formularios de incidentes y de acciones | Zod |
| Fechas | date-fns, locale `es` donde se muestra al usuario |
| Acciones de servidor | `src/app/actions.ts`: leer y escribir JSON, guardar trivia, incidentes |
| IA preparada y no usada por la UI | Genkit con el plugin de Google AI, modelo `googleai/gemini-2.0-flash` |
| Firebase | Dependencia y `studio.json` presentes. El producto vigente no autentica ni persiste con Firebase |
| Alojamiento previsto en el repo | `apphosting.yaml` (Firebase App Hosting, una instancia). El disco local de ese entorno no es un almacén durable |

El cliente de la trivia importa el banco de preguntas en el bundle. Los resultados y los incidentes se leen y escriben solo en el servidor.

---

## 15. Analítica que el producto ya calcula

| Indicador | Dónde | Definición |
| --- | --- | --- |
| Partidas jugadas | Panel | Cantidad de registros en el historial |
| Puntaje promedio | Panel | Suma de puntajes dividida por partidas, un decimal |
| Últimas partidas | Panel | 5 más recientes |
| Distribución 0–10 | Panel | Cuántas partidas obtuvieron cada puntaje |
| Excelente / Bueno / A mejorar | Resúmenes | 8–10, 6–7 y 0–5, sobre el CSV pegado |
| Actividad por día | Resúmenes | Partidas del CSV agrupadas por día |

No hay embudo de abandono (en qué pregunta se salen), ni preguntas más falladas, ni separador por curso o grupo.

---

## 16. Requisitos previstos y no activos

Estos vienen del diseño original (`docs/blueprint.md`) o del código que quedó sin pantalla. No forman parte de la experiencia actual.

| ID | Requisito | Notas |
| --- | --- | --- |
| RP-001 | Cuenta con correo y contraseña | Retirada. Las rutas redirigen al inicio |
| RP-002 | Roles estudiante, docente y directivo con permisos distintos | El tipo sigue en el código. La interfaz no lo pide ni lo exige |
| RP-003 | Alta de un administrador inicial | Ruta `/setup-admin` redirige al inicio |
| RP-004 | Grupos con miembros y registros compartidos | Solo existe el tipo `Group` |
| RP-005 | Invitaciones con token y vencimiento | Solo existe el tipo `Invitation` |
| RP-006 | Resumen en prosa generado por IA sobre incidentes o sobre la trivia | El flujo Genkit existe. La pantalla de resúmenes no lo llama |
| RP-007 | Panel en tiempo real de incidentes por tipo y por grupo | El panel vigente es de trivia y se actualiza al entrar |
| RP-008 | Páginas de perfil y de configuración | Se quitaron de la cabecera. No hay rutas |
| RP-009 | Barra lateral de navegación | El componente existe y no renderiza nada |

---

## 17. Criterios de aceptación

### 17.1 Entrada

- Dado que abro la app por primera vez en la pestaña, veo el logo y un campo de nombre opcional, y no veo correo ni contraseña.
- Dado que pulso **Entrar** con el campo vacío, el saludo y la cabecera dicen **JUGADOR 1**.
- Dado que escribo `Ana` y pulso **Entrar**, el saludo dice Ana.
- Dado que escribo solo espacios, el nombre queda **JUGADOR 1**.
- Dado que estoy en la trivia y pulso **Cambiar nombre**, vuelvo al formulario y no puedo seguir en la trivia hasta entrar de nuevo.

### 17.2 Trivia

- Dado que pulso **JUGAR**, aparecen 10 preguntas, no más y no menos, salvo que el banco tuviera menos de 10 ítems.
- Dado que elijo la opción correcta, el marcador sube en 1 y esa opción se ve correcta.
- Dado que elijo una incorrecta, el marcador no sube, la elegida se ve incorrecta y la correcta se ve correcta.
- Dado que termino, veo el puntaje sobre 10 y una de las cuatro frases según el porcentaje.
- Dado que termino, el panel, al abrirlo después, incluye esa partida con mi nombre de sesión.

### 17.3 Panel y CSV

- Dado que no hay partidas, el total es 0, el promedio es 0,0/10 y no puedo descargar.
- Dado que hay partidas, el promedio coincide con la media de los puntajes y el gráfico cuenta cada puntaje de 0 a 10.
- Dado que descargo el CSV, la primera fila es `Usuario,Puntaje,Total Preguntas,Fecha` y hay una fila por partida.

### 17.4 Resúmenes

- Dado que pego un CSV válido con encabezado, veo el circular (8–10, 6–7, 0–5) y las barras por día.
- Dado que el área está vacía, veo un aviso y no aparecen gráficos.

### 17.5 Incidentes

- Dado que envío un reporte no anónimo, el listado muestra mi nombre.
- Dado que lo marco anónimo, el listado no muestra mi nombre de sesión.
- Dado que cierro con una observación de al menos 10 caracteres, el estado pasa a cerrado.
- Dado que intento cerrar uno ya cerrado, el sistema lo rechaza.
- Dado que elimino uno, desaparece del listado.

### 17.6 Logo

- El logo circular de Convive+ se ve en la cabecera, en la bienvenida y como icono de la pestaña.

---

## 18. Privacidad

La aplicación guarda nombres escritos por quien juega y, si alguien usa incidentes, descripciones de hechos escolares que pueden ser sensibles (acoso, discriminación, sustancias, comentarios de connotación sexual).

Hoy ese historial lo ve cualquiera que entre. No hay consentimiento, retención ni borrado por persona. El archivo antiguo de usuarios puede contener correos y contraseñas que el flujo nuevo ya no necesita.

Para un uso real con menores, este PRD considera insuficiente el almacenamiento actual. Hace falta un almacén con acceso limitado, dejar de versionar cuentas antiguas y decidir qué datos de incidentes se conservan y por cuánto tiempo.

---

## 19. Métricas de éxito sugeridas

Cuando el producto se use con un grupo real, estas son las medidas útiles. Hoy no hay un tablero distinto del panel de puntajes.

| Medida | Para qué |
| --- | --- |
| Partidas terminadas por semana | Ver si el manual se practica |
| Promedio y porcentaje de partidas con 8 o más | Ver si el contenido se comprende |
| Preguntas con más fallos | Ajustar el manual o la mediación en clase. Hoy no se guardan las respuestas, solo el puntaje |
| Partidas empezadas y no terminadas | Ver abandono. Hoy no se registran |
| Incidentes abiertos y cerrados | Ver si el seguimiento se completa |

---

## 20. Riesgos

| Riesgo | Efecto | Nota |
| --- | --- | --- |
| Disco local como base de datos | Se pierden partidas e incidentes al redesplegar | Hace falta un almacén durable antes de un piloto |
| Escritura simultánea del JSON | Una partida puede no guardarse si dos terminan a la vez | Aceptable en una demo; no en un salón entero |
| Sin control de acceso | Un estudiante ve y puede borrar reportes de convivencia | Bloqueante si se usan incidentes reales |
| `users.json` con claves en claro | Exposición de cuentas viejas | Retirar el archivo del historial y rotar esas claves |
| El botón Reportes no abre incidentes | Quien busca el gestor de hechos llega al panel de trivia | Decidir si el segundo módulo es el panel o los incidentes |
| La etiqueta “Resúmenes IA” | Quien la usa espera un texto del modelo y recibe gráficos locales | Renombrar o conectar el flujo |
| Partida solo en memoria | Recargar pierde el avance | Aceptable si la partida es corta; conviene decirlo en la intro |
| Nombres no únicos | El historial mezcla a distintas personas con el mismo nombre | Coherente con “sin cuentas”; no sirve para calificación individual |

---

## 21. Decisiones de producto ya tomadas

1. No hay usuario ni contraseña.
2. El nombre es opcional y el valor por defecto es **JUGADOR 1**.
3. El logo oficial es la imagen circular entregada para la aplicación.
4. La trivia es el módulo de entrada. El panel mide la trivia, no los incidentes.
5. Los resúmenes visibles son gráficos de un CSV, no un texto de IA.

---

## 22. Glosario

| Término | Significado |
| --- | --- |
| Partida | Una sesión de 10 preguntas terminada |
| Banco | Las 98 situaciones de `data/trivia.json` |
| JUGADOR 1 | Nombre que se asigna si la persona no escribe otro |
| Incidente | Registro de un conflicto o de un logro de convivencia |
| Panel | Pantalla `/reports` con métricas de la trivia |
| Resúmenes | Pantalla `/summaries`, gráficos a partir de un CSV |
| Sesión | La pestaña del navegador mientras conserve el nombre |

---

## 23. Referencias en el repositorio

| Pieza | Ruta |
| --- | --- |
| Inicio y bienvenida | `src/app/page.tsx` |
| Trivia | `src/app/trivia/page.tsx` |
| Panel | `src/app/reports/page.tsx` |
| Gráficos del CSV | `src/components/summaries/AISummaryView.tsx` |
| Nombre de la sesión | `src/contexts/UserContext.tsx` |
| Acciones de datos | `src/app/actions.ts` |
| Catálogo de incidentes | `src/lib/constants.ts` |
| Banco y resultados | `data/trivia.json`, `data/trivia_results.json` |
| Incidentes | `data/incidents.json` |
| Logo | `public/convive-logo.jpg` |
| Diseño original | `docs/blueprint.md` |
| Flujo de IA no conectado | `src/ai/flows/summarize-incident-reports.ts` |
