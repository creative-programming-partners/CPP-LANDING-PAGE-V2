# CPP Landing Page · v2

Versión 2 de la landing de Creative Programming Partners. Sitio estático sin dependencias ni compilación: `index.html`, `styles.css`, `script.js` y `assets/`.

## Dirección visual: "la placa que ejecuta código"

| Token | HEX | Uso |
|---|---|---|
| Solder | `#06231B` | Fondo (máscara de soldadura) |
| Mask | `#0B3528` | Superficies |
| Trace | `#145443` | Bordes, pistas |
| Gold | `#E8C15A` | Acción principal, pads |
| Signal | `#72F2D2` | Señal viva, foco (menta de la marca) |
| Silk | `#EEF2E6` | Texto (serigrafía) |

Tipografía: **Martian Mono** (titulares y código, con eje de ancho animado) + **Instrument Sans** (lectura).

## Movimiento y efectos

- Arranque tipo terminal (una vez por sesión; se salta con cualquier tecla o clic).
- Símbolo CPP en 3D renderizado en ASCII en tiempo real (raymarching en canvas): los tres módulos se ensamblan, se gira arrastrando y la luz sigue al puntero. Se pausa fuera de pantalla.
- Titular con eje de ancho variable que responde al puntero; titulares que se decodifican al aparecer.
- Riel de señal que recorre la página con el scroll y enciende un pad por sección.
- Manifiesto que se "ejecuta" palabra por palabra.
- Beneficios como un `diff`, servicios como un editor con código que se escribe solo, proceso como un `git log` que se dibuja.
- Proyectos con mini interfaces vivas (panel, tienda con carrito, calendario de reservas).
- Retratos con trama de puntos que pasan a color al pasar el cursor.
- Paleta de comandos (`Ctrl/⌘ + K` o `/`), barra de estado tipo IDE, cursor caret, botones magnéticos, tarjetas con inclinación y luz.
- Todo respeta `prefers-reduced-motion`.

## Vista local

```bash
npx http-server -p 5174 -c-1
```

## Antes de publicar

1. **Activa el formulario.** En `script.js`, completa `CONFIG.endpoint` (Formspree, Web3Forms o una función propia que reciba JSON) o `CONFIG.whatsapp` (número con código de país). Sin ninguno de los dos, el formulario valida pero avisa que el envío no está activo.
2. Publica un correo o WhatsApp visible como canal alternativo.
3. Revisa la política de privacidad (`privacy.html`) con asesoría adecuada.
4. Actualiza la imagen Open Graph (`assets/brand/png/cpp-social-cover-1200x630.png`) a la nueva paleta.
5. Sustituye los conceptos demostrativos por casos reales cuando existan.
