export const money=n=>new Intl.NumberFormat("es-CU").format(n)+" CUP";
export function shipping(mode,municipality,locality,rates={}){if(mode==="pickup")return 0;const n=rates[municipality+"|"+locality];return typeof n==="number"&&Number.isFinite(n)&&n>=0?n:null}
export function whatsappUrl(phone,text){const n=String(phone||"").replace(/[^0-9]/g,"");return /^[1-9][0-9]{7,14}$/.test(n)?"https://wa.me/"+n+"?text="+encodeURIComponent(text):null}
function section(title,lines){const present=lines.filter(Boolean);return present.length?[`*${title}*`,...present]:[]}
export function orderMessage(order,tenant={}){
const pickupPoint=tenant.pickupPoint||"nuestra tienda",orderTitle=tenant.orderTitle||"PEDIDO";
const products=order.lines.map(p=>`• ${p.quantity} × ${p.n}${p.d?` (${p.d})`:""} — ${money(p.p*p.quantity)}`);
const map=order.location?`https://www.google.com/maps/search/?api=1&query=${order.location}`:null;
const fulfillment=order.mode==="delivery"
?section("Entrega",[
"Modalidad: A domicilio",
order.municipality&&`Municipio: ${order.municipality}`,
order.locality&&`Localidad: ${order.locality}`,
order.address&&`Dirección: ${order.address}`,
order.referenceAddress&&`Referencia: ${order.referenceAddress}`,
map&&`Ubicación: ${map}`
])
:section("Recogida",[
"Modalidad: Recoger en tienda",
`Punto: ${pickupPoint}`,
"Te confirmaremos por WhatsApp cuándo esté listo."
]);
const shippingText=order.mode==="pickup"?"Sin costo":order.fee===null?"Por confirmar":money(order.fee);
const totalText=order.fee===null?"Pendiente de mensajería":money(order.subtotal+order.fee);
return [
`🟦 *${orderTitle} · PEDIDO #${order.reference}*`,
"",
...section("Productos",products),
"",
...section("Importes",[
`Subtotal: ${money(order.subtotal)}`,
order.mode==="pickup"?"Recogida: Sin costo":`Mensajería: ${shippingText}`,
`Total: ${totalText}`
]),
"",
...fulfillment,
"",
...section("Cliente",[
`Nombre: ${order.fullName}`,
`Teléfono: ${order.phone}`
]),
"",
"✅ *Solicitud lista para confirmar.*",
"💬 Confirma disponibilidad y coordinación por este WhatsApp."
].join("\n").replace(/\n{3,}/g,"\n\n")
}
