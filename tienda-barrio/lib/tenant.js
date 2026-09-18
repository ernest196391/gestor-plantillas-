// ─────────────────────────────────────────────────────────────────────────
//  PUNTO ÚNICO DE CAMBIO PARA SERVIR VARIOS NEGOCIOS
//
//  Hoy  ·  un negocio por despliegue: los datos salen de config/tenant.json.
//  Luego·  autoservicio: resuelve el negocio por dominio contra la base de
//          datos y devuelve exactamente el mismo objeto. Ningún otro fichero
//          del proyecto necesita enterarse.
//
//  Regla de la plantilla: NADA fuera de config/tenant.json puede nombrar a un
//  negocio concreto. La prueba tests/plantilla.test.mjs lo vigila.
// ─────────────────────────────────────────────────────────────────────────
import data from "../config/tenant.json";

export const tenant=data;

/** Clave de almacenamiento propia del negocio, para que dos tiendas
 *  abiertas en el mismo navegador nunca se pisen el carrito. */
export const storeKey=name=>data.slug+":"+name;

/** Texto del asistente con los datos del negocio ya sustituidos. */
export const persona=()=>data.assistant.persona
  .replace("{name}",data.name)
  .replace("{address}",data.address);
