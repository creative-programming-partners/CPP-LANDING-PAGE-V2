# CPP Landing Page · v2

Landing de Creative Programming Partners. Sitio estático sin compilación: `index.html`, `styles.css`, `script.js`, `team.js`, `assets/`, `media/` y `fonts/`.

## Dirección visual: Vitrina

Noche azul con el cobalto de la marca. El trabajo real se muestra en video: un muro 3D con capturas de los sitios publicados de fondo, y un celular que reproduce una grabación de esos sitios.

| Token | Valor | Uso |
|---|---|---|
| `--night` | `#050F17` | Fondo |
| `--surface` | `#0B1A26` | Paneles y tarjetas de vidrio |
| `--cobalt` | `#1D5AE0` | Resplandor y tinte de los videos |
| `--blue` | `#5B8CFF` | Acción: botones, pestañas, foco |
| `--text` | `#F4F7F5` | Texto principal |
| `--text-2` | `#9AAFB9` | Texto secundario |

Tipografía: **Instrument Serif** (titulares, desde Google Fonts) + **Satoshi** (lectura, alojada en `fonts/`).

## Secciones

1. Hero: ventana con el video del muro, titular, campo para escribir lo que necesitas y botón a WhatsApp.
2. Cinta con los términos reales (precio por escrito, 50/50, dominio .com, 2 rondas de cambios).
3. Vitrina: celular con la grabación de los sitios y carrusel de capturas detrás.
4. Trabajo: Hotel Bahía de Cuba (web, panel y reserva en celular) y dos ejemplos publicados, Pachanka (pachankarestaurant.com y carta.pachankarestaurant.com) y Alma de Poeta. **No se presentan como clientes.**
5. Precios: cotizador con los siete servicios; calcula el total y el 50/50 y arma el mensaje de WhatsApp. Cada servicio tiene un botón **Ver ejemplo** que abre una ficha con un caso real (Pachanka, su carta, Bahía de Cuba), un prototipo (OdontoPlus VMT) o una demostración marcada como tal (automatización y tienda con pagos). Los datos están en `script.js` (`EXAMPLES`) y las capturas en `media/examples/`.
6. Proceso, equipo (cada foto abre la ficha del socio), preguntas y cierre.

## Idiomas

Español e inglés. El idioma inicial sale del navegador y se recuerda la elección.

- El español está en `index.html`; el inglés, en el atributo `data-en` de cada elemento (y `data-en-alt`, `data-en-aria-label`, `data-en-placeholder` para atributos).
- Los nombres de servicios para el mensaje de WhatsApp están en `script.js` (`NAMES`).

## Equipo

Cada foto abre la ficha del socio con foto, especialidad, bio, frase y tres pestañas: **Perfil**, **En CPP** y **Stack**. Se navega con flechas y se cierra con Esc.

Los datos están en `team.js`. **Los textos actuales son de ejemplo**: reemplázalos con la información real.

## Videos

- `media/cpp-muro.mp4`: muro 3D de capturas reales, con el tinte cobalto ya grabado (1080p, en bucle).
- `media/cpp-trabajo-movil.mp4`: grabación en celular de Bahía de Cuba, su reserva, la carta de Pachanka y Alma de Poeta.
- `media/work/`: capturas actuales de Bahía de Cuba.

Los videos no se descargan hasta que la página termina de pintarse, y se pausan fuera de vista. El botón "Pausar movimiento" detiene videos y animaciones; con `prefers-reduced-motion` todo arranca quieto.

## Movimiento

GSAP 3.12.5 y ScrollTrigger desde cdnjs. Solo se animan `transform`, `opacity` y `clip-path`; lo que está debajo del hero se prepara cuando el navegador queda libre.

## Vista local

```bash
npx http-server -p 5174 -c-1
```

## Contacto y WhatsApp

Todo termina en WhatsApp al +51 929 363 454 con el mensaje ya escrito: el campo del hero, el cotizador, la ficha del caso y el cierre.

## Compartir y buscadores

- Vista previa (Open Graph y Twitter), `canonical`, datos estructurados (`ProfessionalService` con los servicios y precios), `robots.txt`, `sitemap.xml`, `apple-touch-icon` y `404.html`.
- **Dominio:** el sitio se publica en `https://cppcstudio.com` (Cloudflare, desde `main`; `publicar.mjs` copia a `dist/` los archivos del sitio, `assets/`, `media/` y `fonts/`). Si cambia el dominio, actualiza las URL absolutas en `index.html` (`og:*`, `twitter:*`, `canonical` y el JSON-LD), `robots.txt` y `sitemap.xml`.
- La copia de GitHub Pages redirige sola a la misma página en `cppcstudio.com`.

## Pendientes que dependen de CPP

1. Sumar testimonios de los clientes (nombre, negocio y una frase).
2. Cambiar los textos de ejemplo de `team.js` por los reales.
3. Captura nueva del panel de Bahía de Cuba (la actual es del diseño anterior).
4. Revisar `privacy.html` con asesoría legal.

## Marca

Los archivos de `assets/brand/` están en la paleta cobalto (`#1d5ae0` y `#5b8cff`). El wordmark va en curvas, así que el logotipo se ve igual aunque el equipo no tenga instalada la tipografía.

| Archivo | Para qué |
|---|---|
| `cpp-banner.svg` · `png/cpp-banner-1280x400.png` | Cabecera de README, portada de LinkedIn |
| `cpp-logo-horizontal-{dark,light}.svg` | Firma completa |
| `cpp-symbol-{dark,light}.svg` | Solo el símbolo |
| `cpp-social-avatar.svg` | Perfil en redes |
| `cpp-social-cover.svg` · `png/cpp-social-cover-1200x630.png` | Imagen Open Graph |

Se regeneran con `scripts/generar-marca.py` (en la carpeta `CPP-Marca`).
