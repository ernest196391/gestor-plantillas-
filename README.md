# Gestor · Plantillas

Moldes para construir webs de negocios cubanos. Cada plantilla se activa
diciéndole a una IA qué negocio quieres montar; ella hace el resto.

Este repositorio guarda **lo que se ejecuta**. El método — cómo se hace un
logotipo, cómo se fotografía un producto, cómo se lee un catálogo — vive en
`gestor-brand-system`.

## Qué hay aquí

```
tienda-barrio/            la tienda de bodega o mercado
remesas-negocio/          web, panel y Cuadre para un negocio de remesas
banco-productos/          fotos de productos de marca, compartidas
.claude/skills/           las instrucciones que sigue la IA
```

## Cómo se usa, sin saber programar

Abre este repositorio con una IA que pueda leer archivos y escribe, tal cual:

> Monta una tienda para la Bodega La Esquina, en Santos Suárez.

La IA carga la instrucción de `.claude/skills/tienda-barrio/`, te va
preguntando lo que necesita — nombre, WhatsApp, horario, productos, precios —
y te entrega el enlace funcionando.

No tienes que abrir ningún archivo. Si la IA te pide que edites algo a mano,
está haciéndolo mal.

## Las plantillas

### `tienda-barrio`

Catálogo con fotos, carrito, checkout que termina en WhatsApp, tarifas de
envío por municipio y reparto de La Habana, y una ayudante de IA con el nombre
que elija el negocio.

**En producción:** [Mercado 23 y 28](https://mercado23y28.vercel.app) — el
negocio real del que salió esta plantilla.

Pruébala tal cual:

```
cd tienda-barrio
npm install
npm run dev
```

Verás una bodega de ejemplo con imágenes grises de relleno. Eso es lo que
sustituye la IA con los datos del negocio de verdad.

## El banco de fotos

Lo que hace que el negocio número 30 sea mucho más rápido que el primero.

La mayoría de lo que vende una bodega —Trapiche, Cristal, Gullón, Milka,
Lay's— lo vende también la bodega de al lado. Esas fotos se hacen **una vez** y
se reutilizan en todas las tiendas. Cada negocio solo fotografía lo suyo del
mostrador: la carne cortada, los quesos, los embutidos.

De los 45 productos del Mercado 23 y 28, **37 eran de marca**. Ocho de cada
diez fotos ya estaban hechas para el siguiente negocio.

Para ver qué tienes ya:

```
cd banco-productos
node buscar.mjs "Trapiche Malbec" "Cerveza Cristal" "Carne de cerdo"
```

Responde en tres grupos: lo que ya está, lo que se parece pero hay que
confirmar, y lo que hay que fotografiar.

**Regla del banco:** solo productos de marca. Lo del mostrador es de cada
negocio y no se comparte.

## La regla que mantiene esto vivo

> Ningún fichero de código puede nombrar a un negocio concreto.
> Todo lo que describe a un negocio vive en ficheros de datos.

`npm test` la comprueba y señala el fichero exacto si alguien la rompe. Sin
ese centinela, una plantilla se ensucia en tres negocios y deja de servir.

## Estado

| Pieza | Estado |
|---|---|
| Plantilla de tienda de barrio | funcionando, un negocio real en producción |
| Banco de fotos | 37 productos, 23 marcas |
| Skill de alta | escrita, falta estrenarla con un negocio nuevo |
| Plantilla de servicios (tipo NEXO) | pendiente |
| Plantilla de remesas (tipo Cuyana) | contrato y skill definidos; implementación en curso |
