# CPP Landing Page · v2

Versión 2 de la landing de Creative Programming Partners. Sitio estático sin dependencias ni compilación: `index.html`, `styles.css`, `script.js` y `assets/`.

## Dirección visual

"Constelación sobre terciopelo negro": negro puro como lienzo, tipografía monolítica y un único violeta para la acción. Sin paneles, bordes ni sombras; la jerarquía sale de la escala, el contraste y el espacio. Solo tema oscuro.

| Token | Valor | Uso |
|---|---|---|
| `--color-void` | `#000000` | Fondo de toda la página |
| `--color-bone-white` | `#FFFFFF` | Titulares y texto principal |
| `--color-ash-gray` | `#9A9A9A` | Navegación inactiva, textos secundarios |
| `--color-silver-mist` | `#BDBDBD` | Texto de apoyo |
| `--color-electric-iris` | `#8052FF` | Botón principal (uno por vista) y acentos de marca |
| `--color-saffron-spark` | `#FFB829` | Etiquetas, enlaces y énfasis |
| `--color-deep-verdant` | `#15846E` | Degradado del logo y partículas |

Tipografía: **PPNeueMontreal** si está instalada, con **Inter** como sustituto. Titulares en peso 400 a 78–113px con tracking de -0.04em; cuerpo en peso 200 a 18px; navegación y etiquetas en 14px, peso 600, mayúsculas.

La única línea visible de la página es la de los campos del formulario: sin ella no se ven.

## Idiomas

Español e inglés. El idioma inicial sale del navegador y se recuerda la elección.

- Textos estáticos: el español vive en `index.html` (atributos `data-i18n`, `data-i18n-html`, `data-i18n-attr`); el inglés, en `i18n.js` → `en`.
- Textos generados por JavaScript y servicios: `i18n.js` → `strings`, `services`. Equipo: `team.js`.
- Para agregar un idioma, añade su bloque en esos objetos y una opción en el botón de idioma.

## Equipo

Cada socio abre una tarjeta con foto, especialidad, bio, frase y tres pestañas: **Perfil** (datos), **En CPP** (resumen, tareas y enfoque) y **Stack** (tecnologías por grupo). Se navega entre socios con flechas o deslizando, y LinkedIn queda como botón dentro de la tarjeta.

Los datos están en `team.js`. **Los textos actuales son de ejemplo**: reemplázalos con la información real. Los campos o pestañas vacíos no se muestran.

## Movimiento y efectos

- Hero: el símbolo CPP en 3D, formado por miles de triángulos delineados de colores. Los tres módulos se ensamblan al cargar, la figura se balancea alrededor de la vista del logo, se gira arrastrando y las partículas se apartan del puntero.
- Proyectos: pictogramas de partículas que se mueven solos (barras que se reordenan, productos que caen en la bolsa, turnos que se confirman en un calendario).
- Partículas de ambiente, pocas y tenues, en toda la página.
- Manifiesto que se enciende palabra por palabra con el scroll; tachado que se dibuja sobre "lo que se quita"; pasos del proceso que se iluminan al llegar.
- Equipo en carrusel con puntos; el perfil se abre a pantalla completa y el retrato viaja hasta su lugar.
- Los lienzos se pausan fuera de pantalla y con la pestaña oculta. Todo respeta `prefers-reduced-motion`.

## Vista local

```bash
npx http-server -p 5174 -c-1
```

## Antes de publicar

1. **Activa el formulario.** En `script.js`, completa `CONFIG.endpoint` (Formspree, Web3Forms o una función propia que reciba JSON) o `CONFIG.whatsapp` (número con código de país). Sin ninguno de los dos, el formulario valida pero avisa que el envío no está activo.
2. Publica un correo o WhatsApp visible como canal alternativo.
3. Revisa la política de privacidad (`privacy.html`) con asesoría adecuada.
4. Sustituye los conceptos demostrativos por casos reales cuando existan.

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
