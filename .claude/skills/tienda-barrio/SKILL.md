---
name: tienda-barrio
description: Monta la tienda online completa de un negocio de barrio (bodega, mercado, minimercado) a partir de sus datos, su inventario y sus fotos. Incluye catálogo, carrito, checkout por WhatsApp, tarifas de envío por municipio de La Habana y un asistente de IA con el nombre del negocio. Úsala cuando alguien pida montar, crear o abrir la tienda o la web de un negocio de barrio, cuando diga "monta una tienda para X", cuando traiga fotos de estantes o un Excel de inventario para convertirlo en tienda, o cuando quiera duplicar la tienda de Mercado 23 y 28 para otro comercio.
---

# Montar la tienda de un negocio de barrio

Tu trabajo es entregar una tienda publicada y funcionando. La persona que te
lo pide **no es técnica**: no le pidas que edite ficheros, que entienda JSON ni
que sepa qué es un despliegue. Pregunta en español llano y hazlo tú.

## Lo que entregas al final

Un enlace que funciona, donde el dueño ve su negocio con su nombre, sus
colores, sus productos, sus precios y su WhatsApp.

## Antes de empezar, lee

- `tienda-barrio/PLANTILLA.md` — el contrato de la plantilla.
- `banco-productos/banco.json` — qué fotos ya existen y no hay que repetir.

## Paso 1 · Los datos del negocio

Pregunta, de una en una y en lenguaje normal. No sueltes un formulario entero.

| Necesitas | Pregunta así |
|---|---|
| nombre | ¿Cómo se llama el negocio, tal como lo pondrías en el letrero? |
| lema | En una frase, ¿qué le dirías a un vecino sobre el negocio? |
| dirección | ¿Dónde está? Calle, entre calles, reparto y municipio |
| WhatsApp | ¿A qué número de WhatsApp le llegan los pedidos? |
| horario | ¿De qué hora a qué hora abren? ¿Todos los días? |
| colores | ¿Tiene colores de marca? Si no, propón dos a partir del letrero |
| asistente | ¿Cómo quieres que se llame la ayudante virtual? |

**Nunca inventes el WhatsApp, el horario ni la dirección.** Si falta uno, para
y pídelo. Son los datos por los que el negocio pierde ventas si están mal.

Con eso rellenas `config/tenant.json`. Parte siempre de
`config/tenant.example.json`.

## Paso 2 · Las tarifas de envío

`config/localities.json` ya trae los municipios y repartos de La Habana. Las
**tarifas** son de cada negocio, porque son distancias desde su puerta.

Pregunta por zonas, no por localidades una a una:
*«¿Cuánto cobras por llevar a Vedado? ¿Y a Playa? ¿Y a Guanabacoa?»*
Con tres o cuatro referencias, propón el resto y **pide que lo confirme**.

Si no hay tarifas todavía, deja solo recogida en tienda. Es mejor que un
precio inventado.

## Paso 3 · El inventario

Acepta lo que traiga: fotos de los estantes, un Excel, una lista escrita a
mano, o dictado.

De cada producto necesitas: **nombre, presentación, categoría y precio**.

Reglas que no se saltan:

1. **Una foto puede tener varios productos.** No asumas una foto, un producto.
2. **Separa lo que ves de lo que supones.** Si el precio no se lee en la foto,
   pregúntalo; no lo estimes en silencio.
3. **Si estimas un precio porque el dueño lo pide**, díselo en claro y déjalo
   anotado.
4. Las categorías salen del propio catálogo. No hace falta declararlas aparte.

Resultado: `lib/catalog.js`.

## Paso 4 · Las fotos — mira primero en el banco

**Este es el paso que decide si el trabajo dura una hora o un día.**

La mayoría de los productos de una bodega son de marca, y los vende también la
bodega de al lado. Esas fotos se hacen **una vez** y se reutilizan.

```
cd banco-productos
node buscar.mjs --archivo inventario.txt
```

Te devuelve tres grupos:

- **Ya en el banco** — copia la imagen a `public/products/` y listo.
- **Posibles** — el banco cree que es el mismo producto pero no está seguro.
  **Enséñale la foto al dueño y que confirme.** Nunca la des por buena tú.
- **Hay que conseguir foto** — casi siempre son productos del mostrador: carne
  cortada, quesos en bloque, embutidos. Esos son de cada negocio.

Para los que falten, por este orden:

1. **Foto real del producto** sobre fondo claro. Es la mejor y la más honesta.
2. **Recorte de la foto del estante**, si se ve bien y sin reflejos.
3. **Generar la imagen con IA** — solo si no hay más remedio, y con estas
   condiciones:
   - parte de la foto real del producto, nunca de la nada;
   - **no inventes la etiqueta, la marca ni el envase**: si no se lee en la
     foto real, no se escribe;
   - compara lo generado contra la foto real antes de aceptarlo;
   - un producto de marca ajena con la etiqueta inventada es un problema con
     esa marca, no un detalle estético.

Deja las fotos en **WebP cuadrado de 800 px**. Si una foto nueva es de un
producto de marca, **añádela al banco** con su entrada en `banco.json`: el
siguiente negocio ya no tendrá que hacerla.

## Paso 5 · La marca

Sustituye en `public/brand/`:

- `logo.png` — el isotipo, cuadrado
- `hero.png` — foto de la fachada, apaisada
- `assistant-avatar.png` — la cara de la ayudante virtual

Si no hay logotipo, dilo y ofrece hacer uno. No dejes el interrogante gris
puesto en una tienda que va a ver el dueño.

## Paso 6 · Comprobar antes de enseñar

```
npm test          # el centinela, las tarifas y el mensaje de pedido
npm run build     # que compile
```

`npm test` falla si quedó algo del negocio anterior escrito en el código.
**Si falla, arréglalo antes de seguir.** Ese es su trabajo.

Después, con la tienda levantada, comprueba a mano:

- cada categoría enseña sus productos y todas las fotos cargan;
- añadir al carrito suma uno, no dos;
- el checkout llega hasta el botón de WhatsApp;
- se puede cancelar el pedido y vaciar el carrito;
- el asistente responde y sabe el horario y la dirección.

## Paso 7 · Publicar

Despliega y configura `OPENAI_API_KEY` en el entorno. Sin esa clave la tienda
funciona igual, pero el asistente sale apagado con un aviso.

Comprueba en la web publicada, no solo en local:

- `/api/commerce/config` responde con el WhatsApp correcto y `assistantReady`;
- `/api/assistant/health` responde `status: 200`.

## Paso 8 · Entregar

Dale el enlace y, en cuatro líneas, qué puede cambiar él mismo y qué necesita
pedirte. Di también qué quedó pendiente: precios estimados, fotos provisionales,
tarifas sin confirmar. **No entregues una tienda diciendo que está perfecta si
sabes que tiene algo a medias.**

## Errores que ya se cometieron, no los repitas

- Poner una foto de otro producto porque «se parecía». El banco marca las
  dudosas por algo.
- Dejar en la tienda productos sin foto propia: se ven como un hueco y el
  dueño lo nota enseguida.
- Escribir el nombre del negocio dentro del código en vez de en
  `config/tenant.json`. El centinela lo caza, pero cuesta menos no hacerlo.
- Dar por bueno un precio estimado sin decirlo.
