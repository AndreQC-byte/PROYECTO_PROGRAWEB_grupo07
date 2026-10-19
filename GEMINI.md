# REGLAS ESTRICTAS DEL PROYECTO: MESA DE AYUDA DE SERVICIOS DEL CAMPUS (ULIMA)

Actúa como un desarrollador Senior experto en React y Node.js. Todo el código que generes, modifiques o sugieras en este repositorio DEBE cumplir obligatoriamente con los siguientes lineamientos académicos y técnicos. Cualquier desviación invalidará la entrega.

---

## 1. TECNOLOGÍAS PERMITIDAS Y PROHIBICIONES (CRÍTICO)
- **Interfaz (Frontend):** React puro (JSX) utilizando únicamente `hooks` (`useState`, `useEffect`, `useMemo`, `useContext`, etc.) y **Context API** (`src/context/`) para el estado global.
- **Estilos:** CSS propio (`src/styles/globals.css` y `src/styles/theme.css`) o preprocesador. Se permite Material UI o similares si el grupo lo requiere, pero respetando el sistema de diseño al pie de la letra.
- **Servicios Web (Entrega 2):** Node.js con Express bajo estilo REST. Base de datos con ORM o patrón Repository.
- **PROHIBIDO TERMINANTEMENTE:**
  - NO usar Redux, Zustand, TanStack Query ni librerías externas de estado no autorizadas.
  - NO usar Tailwind CSS si contradice la hoja de estilos propia acordada, ni usar plantillas de administración o temas comerciales.
  - NO usar NestJS, Firebase, Supabase ni servicios que sustituyan la construcción manual de capas.
  - NO exponer credenciales en el código; en la Entrega 2 todo irá en variables de entorno (`.env`).

---

## 2. ARQUITECTURA DE CARPETAS Y REGLAS DE CONVIVENCIA GRUPAL
El proyecto sigue la estructura definida en `mesa-de-ayuda/`:
- **`src/components/` (Módulo Compartido):** Contiene `common/` (`Boton.jsx`, `EtiquetaEstado.jsx`, `EtiquetaPrioridad.jsx`, `DialogoConfirmacion.jsx`), `layout/` (`Encabezado.jsx`, `NavegacionSidebar.jsx`) y `ticket/` (`TarjetaTicket.jsx`, `Bitacora.jsx`). **REGLA:** Reutiliza siempre estos componentes; NO los dupliques dentro de `src/features/`.
- **`src/data/db.json` (Contrato de Datos y Datos Semilla):** En la Entrega 1 toda la data se maneja íntegramente en el frontend leyendo este archivo JSON. **REGLA:** No alteres la estructura de propiedades (nombres de campos, tipos o valores admitidos) de `db.json` sin autorización explícita.
- **`src/features/` (División por Historia Funcional - HU):**
  - `auth/` (HU-1: Cuenta y acceso)
  - `catalogo/` (HU-2: Catálogo de servicios)
  - `registro_ticket/` (HU-3: Registro y seguimiento de tickets)
  - `cola_asignacion/` (HU-4: Cola y asignación)
  - `atencion/` (HU-5: Atención y cierre)
  - `encuestas/` (HU-6: Encuesta de satisfacción)
  - `metricas/` (HU-7: Métricas y usuarios)
  - **REGLA DE AISLAMIENTO:** Cuando trabajes en una Historia Funcional (HU), **NUNCA modifiques ni escribas sobre las entidades o vistas de otra HU**. Si una HU necesita datos de otra (ej. leer ambientes o categorías al crear un ticket), solo realiza operaciones de **lectura**.
- **Separación por capas:** Prohibido poner consultas directas o lógica pesada de acceso a datos dentro de los componentes visuales de interfaz (ni acceso a datos en controladores en el backend).

---

## 3. REQUERIMIENTOS NO FUNCIONALES OBLIGATORIOS EN CADA VISTA
Todo componente o vista que generes debe incluir obligatoriamente:
1. **Idioma:** 100 % en español (interfaz, mensajes de error, etiquetas, nombres de variables de dominio y comentarios).
2. **Validación de formularios en línea:** Los formularios deben validar lo ingresado y mostrar el mensaje de error exactamente debajo o junto al campo afectado (ej. *"El nombre es obligatorio"*, *"Las contraseñas no coinciden"*).
3. **Notificación de escritura:** Toda operación de creación, edición o cambio de estado debe mostrar una notificación clara de su resultado (Éxito, Error, Advertencia o Información).
4. **Confirmación destructiva:** Toda acción destructiva o crítica (cancelar ticket, desactivar categoría con tickets en curso, devolver a la cola en lote, bloquear cuenta) debe abrir primero el `DialogoConfirmacion.jsx` o modal explícito pidiendo confirmación y motivo cuando corresponda.
5. **Estados vacíos (Empty States):** Toda tabla, bandeja o listado que pueda quedar sin registros o sin resultados de búsqueda DEBE renderizar un estado vacío amigable con un llamado a la acción (ej. *"Todavía no has reportado nada"*, *"No hay tickets con estos filtros"*).

---

## 4. SISTEMA DE DISEÑO (UI/UX)
Aplica estos tokens de diseño en `src/styles/theme.css` y respétalos en cada componente:

### Paleta de Colores
- `primary`: `#1F4E79` | `primary-dark`: `#163A5A` | `primary-soft`: `#E7EFF6`
- `accent`: `#D2601A` (usar solo en elementos urgentes)
- `bg`: `#F4F6F8` | `surface`: `#FFFFFF` | `border`: `#D6DEE5`
- `text`: `#141C24` | `text-muted`: `#5F6C78`
- Semánticos: `success`: `#1E7F4D` | `warning`: `#B7791F` | `danger`: `#B4322B` | `info`: `#3B6FA8`

### Colores de Prioridad ( incluyen barra lateral en la fila de tabla)
- **Crítica:** `#B4322B` | **Alta:** `#D2601A` | **Media:** `#B7791F` | **Baja:** `#3B6FA8`

### Colores de Estado del Ticket
- **Abierto:** `#3B6FA8` | **En atención:** `#B7791F` | **En espera:** `#5F6C78`
- **Resuelto:** `#1E7F4D` | **Cerrado:** `#1E7F4D` | **Reabierto:** `#B4322B`

### Tipografía y Medidas Estructurales
- **Fuentes:** `IBM Plex Sans` para toda la interfaz y `IBM Plex Mono` para códigos (ej. `TCK-2026-00147`, `H-210`).
- **Jerarquía tipográfica:**
  - Título de pantalla: `28px / 32px`
  - Título de sección: `20px / 28px`
  - Subtítulo: `16px / 24px`
  - Cuerpo de texto: `15px / 22px`
  - Auxiliar: `13px / 18px`
  - Etiqueta: `12px / 16px`
- **Geometría y Layout (1920 × 1080 escritorio + responsivo):**
  - `border-radius`: `4px` en todos los elementos (botones, inputs, tarjetas, modales).
  - `box-shadow`: **SIN SOMBRAS** (`none`) en tarjetas y contenedores; las sombras están permitidas **únicamente** en modales y menús desplegables.
  - Altura de filas de tabla: `44px` compactas.
  - Espaciado general: Siempre en múltiplos de `4px` (`4px`, `8px`, `12px`, `16px`, `24px`, etc.).
  - Dimensiones fijas de estructura: Cabecera (`Encabezado.jsx`) de `60px` de alto, Navegacion lateral (`NavegacionSidebar.jsx`) de `236px` de ancho, Pie de página de `44px` de alto, área de contenido centrada a `1200px`.