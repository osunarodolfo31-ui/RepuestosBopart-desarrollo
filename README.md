# BoParts — DESARROLLO / PRUEBAS

Copia independiente del sistema de BoParts para validar cambios antes de usarlos en la tienda.

## Separación

- Sheets y proyecto Apps Script exclusivos de desarrollo.
- Comprobación del identificador del proyecto y de la hoja antes de operar.
- Conexiones al servidor original bloqueadas en las pantallas de pruebas.
- Caché del navegador separada y franja visible de PRUEBAS.
- El catálogo se consulta mediante el servidor de pruebas; no requiere publicar la hoja.
- Las consultas y escrituras requieren una clave de pruebas configurada en las propiedades del script. La clave nunca debe subirse a GitHub.
- La carga de fotografías está deshabilitada hasta disponer de almacenamiento separado.

## Puesta en marcha pendiente

1. En el proyecto Apps Script de desarrollo, configurar la propiedad `BOPARTS_DEV_ACCESS_KEY` con una clave privada de al menos 24 caracteres.
2. Autorizar e implementar ese proyecto como aplicación web. Revisar el alcance de los permisos de Google antes de aceptarlos.
3. Colocar exclusivamente su URL `/exec` en `dev-config.js`.
4. Publicar este repositorio en GitHub Pages y usar «Acceso de pruebas» para ingresar la clave.
5. Verificar una consulta y una operación de prueba en el Sheets de desarrollo antes de considerar operativo el entorno.

El sitio permanece bloqueado mientras falte su servidor o clave. La hoja copiada contiene datos reales y debe permanecer privada. Esta separación no corrige todavía los errores funcionales heredados del sistema original ni sustituye un sistema de usuarios y permisos para una futura plataforma comercial.

## Validación

`node tests/isolation.mjs`: 15 comprobaciones locales con servicios simulados. No equivalen a una prueba completa contra Google. El código del servidor se conserva en `apps-script/` en la copia local de trabajo.
