# Convive+ - Handoff del Proyecto

**Convive+** es una aplicación diseñada para fortalecer la convivencia escolar mediante el aprendizaje interactivo y el monitoreo de resultados. Originalmente concebida como un gestor de incidentes, la aplicación ha evolucionado hacia una plataforma centrada en la **Trivia del Manual de Convivencia** y el análisis de datos.

## 🚀 Funcionalidades Principales

### 1. Módulo de Trivia (Gamificación)
- **Juego Interactivo**: Selección aleatoria de 10 preguntas de un banco de más de 100 situaciones basadas en el manual de convivencia.
- **Feedback Inmediato**: Los estudiantes reciben retroalimentación visual al instante sobre sus respuestas.
- **Persistencia de Datos**: Los resultados se guardan automáticamente, asociándolos al usuario (si está autenticado) para su posterior análisis.

### 2. Panel de Monitoreo (Dashboard)
- **Métricas Clave**: Visualización del total de partidas jugadas y el puntaje promedio global.
- **Historial Reciente**: Listado de las últimas 5 partidas realizadas.
- **Distribución de Resultados**: Gráfico de barras que muestra cuántos jugadores obtuvieron cada puntaje (0 a 10).
- **Exportación**: Botón para descargar el historial completo de resultados en formato CSV para auditorías externas.

### 3. Resúmenes Inteligentes y Analítica Avanzada
- **Visualización de Datos**: Herramienta que procesa archivos CSV de resultados para generar:
  - **Gráfico Circular**: Clasificación del rendimiento (Excelente: 8+, Bueno: 6-7, A mejorar: 5-).
  - **Gráfico de Actividad**: Cronología de partidas jugadas por día.

## 📱 Diseño y UX
- **Mobile-First**: La interfaz está optimizada para una vista vertical (formato 9:16), ideal para dispositivos móviles.
- **Simetría y Elegancia**: Uso de componentes ShadCN y Tailwind CSS para asegurar que los elementos no se superpongan y mantengan una jerarquía visual clara.
- **Navegación Intuitiva**: Acceso directo a los módulos principales desde la pantalla de inicio con botones destacados.

## 🛠️ Detalles Técnicos
- **Stack**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Lucide React (iconos).
- **Gráficos**: Recharts para la visualización dinámica de datos.
- **Persistencia**: Sistema de archivos local (`data/*.json`) para prototipado rápido sin necesidad de base de datos externa.
- **Autenticación**: Sistema de roles (Estudiante, Docente, Directivo) con protección de rutas mediante `AuthGuard`.

## 📂 Estructura de Datos
- `data/trivia.json`: Banco de preguntas y respuestas.
- `data/trivia_results.json`: Historial de partidas jugadas.
- `data/users.json`: Base de datos de usuarios y credenciales.

---
*Este documento marca la transición del proyecto a su estado actual enfocado en el aprendizaje normativo escolar.*
