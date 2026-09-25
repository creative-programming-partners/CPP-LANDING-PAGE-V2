# CPP Landing Page · v2

Versión 2 de la landing de Creative Programming Partners. Sitio estático sin dependencias ni compilación: `index.html`, `styles.css`, `script.js` y `assets/`.

## Dirección visual

Colores originales de CPP, con tema claro y oscuro (se respeta la preferencia del sistema y se recuerda la elección):

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#F7F8F8` | `#050F17` | Fondo |
| `--surface` | `#FFFFFF` | `#0B1A26` | Tarjetas y paneles |
| `--text` | `#071521` | `#F4F7F5` | Texto principal |
| `--text-2` | `#3E545F` | `#9AAFB9` | Texto secundario |
| `--accent` | `#1D5AE0` | `#5B8CFF` | Acción: botones y enlaces (cobalto) |
| `--steel` | `#607985` | `#9AAFB9` | Tercer módulo de la marca |
| `--live` | `#0D7A63` | `#72F2D2` | Confirmaciones y foco |

Tipografía: **Martian Mono** (titulares y código, con eje de ancho animado) + **Instrument Sans** (lectura).

## Idiomas

Español e inglés. El idioma inicial sale del navegador y se recuerda la elección.

- Textos estáticos: el español vive en `index.html` (atributos `data-i18n`, `data-i18n-html`, `data-i18n-attr`); el inglés, en `i18n.js` → `en`.
- Textos generados por JavaScript y servicios: `i18n.js` → `strings`, `services`. Equipo: `team.js`.
- Para agregar un idioma, añade su bloque en esos objetos y una opción en el botón de idioma.

## Equipo

Cada socio abre una tarjeta con foto, especialidad, bio, frase y tres pestañas: **Perfil** (datos), **En CPP** (resumen, tareas y enfoque) y **Stack** (tecnologías por grupo). Se navega entre socios con flechas o deslizando, y LinkedIn queda como botón dentro de la tarjeta.

Los datos están en `team.js`. **Los textos actuales son de ejemplo**: reemplázalos con la información real. Los campos o pestañas vacíos no se muestran.

## Movimiento y efectos

La estética de programador es la textura de la marca; donde el cliente decide (servicios, precios, proceso, formulario) se habla en lenguaje de negocio.

- Símbolo CPP en 3D renderizado en ASCII en tiempo real (raymarching en canvas): los tres módulos se ensamblan, se gira arrastrando y la luz sigue al puntero. Se pausa fuera de pantalla.
- Titular con eje de ancho variable que responde al puntero; titulares que se decodifican al aparecer.
- Riel de señal que recorre la página con el scroll y enciende un pad por sección.
- Manifiesto que se "ejecuta" palabra por palabra.
- Beneficios como un `diff`, servicios como un editor con código que se escribe solo (cada servicio muestra su nombre y precio en la lista), proceso como un `git log` que se dibuja.
- Proyectos con mini interfaces vivas (panel, tienda con carrito, calendario de reservas).
- Retratos con trama de puntos que pasan a color al pasar el cursor (en pantallas táctiles se ven a color).
- Paleta de comandos (`Ctrl/⌘ + K` o `/`), que también cambia tema e idioma y abre WhatsApp; barra de estado tipo IDE (solo en pantallas grandes), botones magnéticos, tarjetas con inclinación y luz.
- Cambio de tema con revelado circular desde el botón (View Transitions).
- Todo respeta `prefers-reduced-motion`.

## Vista local

```bash
npx http-server -p 5174 -c-1
```

## Contacto y WhatsApp

- El formulario abre WhatsApp al +51 929 363 454 con la solicitud escrita y un saludo según la hora (`CONFIG.whatsapp` en `script.js`). Si WhatsApp no se abre en una ventana nueva (navegadores internos de Instagram o Facebook), navega en la misma pestaña, y el mensaje de estado deja un enlace para reintentar.
- Hay un botón flotante de WhatsApp y el número está en el pie.
- Si prefieres recibir las solicitudes por correo, completa `CONFIG.endpoint` (Formspree, Web3Forms o una función propia que reciba JSON): cuando hay endpoint, se usa en lugar de WhatsApp.

## Compartir y buscadores

- Vista previa (Open Graph y Twitter), `canonical`, datos estructurados (`ProfessionalService` con los servicios y precios), `robots.txt`, `sitemap.xml`, `apple-touch-icon` y `404.html`.
- **Las URL son absolutas** y apuntan a `creative-programming-partners.github.io/CPP-LANDING-PAGE-V2/`. Si pasas a un dominio propio, actualízalas en `index.html` (etiquetas `og:*`, `twitter:*`, `canonical` y el JSON-LD), `robots.txt` y `sitemap.xml`.
- `robots.txt` solo cuenta en la raíz de un dominio: en github.io no se lee, con dominio propio sí.
- Para medir visitas y envíos a WhatsApp, pon un ID de Google Analytics 4 en `CONFIG.gaId`. Se registran los eventos `whatsapp_click` y `generate_lead`. Si lo activas, menciónalo en `privacy.html`.

## Pendientes que dependen de CPP

1. Sustituir los conceptos demostrativos por proyectos reales (captura, enlace, qué se hizo y qué cambió) y sumar testimonios.
2. Cambiar los textos de ejemplo de `team.js` por los reales.
3. Dominio propio (y luego actualizar las URL de arriba).
4. Completar las preguntas frecuentes con datos del negocio: formas de pago, adelanto, dominio y hosting, propiedad del sitio, revisiones incluidas y plazos por servicio.
5. Revisar `privacy.html` con asesoría legal.

## Marca

Los archivos de `assets/brand/` están en la paleta cobalto, con el mismo acento
que usa la hoja de estilos: `#1d5ae0` sobre claro y `#5b8cff` sobre oscuro. El
wordmark va en curvas, así que el logotipo se ve igual aunque el equipo no tenga
instalada la tipografía.

| Archivo | Para qué |
|---|---|
| `cpp-banner.svg` · `png/cpp-banner-1280x400.png` | Cabecera de README, portada de LinkedIn |
| `cpp-logo-horizontal-{dark,light}.svg` | Firma completa |
| `cpp-symbol-{dark,light}.svg` | Solo el símbolo |
| `cpp-social-avatar.svg` | Perfil en redes |
| `cpp-social-cover.svg` · `png/cpp-social-cover-1200x630.png` | Imagen Open Graph |

Se regeneran con `scripts/generar-marca.py` (en la carpeta `CPP-Marca`): produce
el SVG y el PNG de cada pieza desde la misma descripción, para que no diverjan.

> El menta `--live` **no** es un resto de la paleta anterior: es el color de
> confirmaciones y foco. No se toca.
