# Plantilla de tienda de barrio

Este repositorio es a la vez **una tienda en producción** (Mercado 23 y 28) y
**la plantilla** de la que salen las demás. El contrato que lo hace posible es
corto y lo vigila una prueba automática.

## La regla

> Ningún fichero de **código** puede nombrar a un negocio concreto.
> Todo lo que describe a un negocio vive en ficheros de **datos**.

`npm test` la comprueba. Si alguien escribe el nombre de una tienda dentro de
un componente, la prueba falla y dice dónde.

## Qué es dato y qué es código

| Datos — cambian en cada negocio | Código — igual para los 100 |
|---|---|
| `config/tenant.json` — identidad, marca, colores, asistente, tarifas | `app/` — páginas, carrito, checkout, asistente |
| `lib/catalog.js` — productos, precios, categorías | `lib/commerce.mjs` — dinero, envío, mensaje de pedido |
| `public/brand/` — isotipo, fachada, avatar | `lib/tenant.js` — de dónde salen los datos |
| `public/products/` — una foto por producto | `config/localities.json` — municipios de La Habana |
| Variables de entorno — `OPENAI_API_KEY` | |

`config/localities.json` **no se toca**: los 339 repartos de La Habana valen
igual para todos. Las **tarifas** sí son de cada negocio, porque son distancias
desde *su* puerta.

## Abrir un negocio nuevo

1. Crear repositorio desde esta plantilla.
2. Copiar `config/tenant.example.json` a `config/tenant.json` y rellenarlo.
3. Sustituir `public/brand/` y `public/products/`.
4. Escribir `lib/catalog.js` con el inventario real.
5. `npm test` — el centinela avisa si quedó algo del negocio anterior.
6. Desplegar y poner `OPENAI_API_KEY`.

Los pasos 3 y 4 son los lentos. Es ahí donde la Skill de alta tiene que
automatizar: de una foto del estante o de un Excel, a productos con precio,
categoría y foto recortada.

## El punto por donde crece

`lib/tenant.js` es **el único fichero** que decide de dónde salen los datos del
negocio. Hoy lee un JSON del repositorio: un negocio por despliegue. Para el
autoservicio de Gestor, ese fichero pasa a resolver el negocio por dominio
contra la base de datos y devuelve el mismo objeto. **Nada más del proyecto se
entera.**

## Qué falta

- Las clases CSS aún se llaman `veci*` y `bessy*` por herencia. Son internas y
  no se ven, pero conviene renombrarlas a `assistant*` algún día.
- El avatar del asistente es una imagen fija en `public/brand/`: cada negocio
  necesita la suya.
