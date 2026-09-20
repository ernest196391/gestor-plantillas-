---
name: remesas-negocio
description: Crea y publica una aplicación independiente de remesas con landing, calculadora, cuentas, seguimiento, panel administrativo y Cuadre incluido. Úsala cuando alguien pida montar un negocio de remesas o adaptar la plantilla a un nuevo corredor entre países; no la uses para tiendas o catálogos.
---

# Montar un negocio de remesas

Entrega una aplicación publicada y funcionando. La persona usuaria no tiene que
editar JSON, ejecutar migraciones ni configurar manualmente el despliegue.

## Antes de actuar

Lee:

- `remesas-negocio/PLANTILLA.md` para el contrato funcional;
- `remesas-negocio/config/tenant.example.json` para los datos requeridos;
- `remesas-negocio/docs/DATA_MODEL.md` antes de modificar Supabase.

## Datos que no se inventan

Pregunta en lenguaje normal por nombre comercial, WhatsApp, países, monedas de
origen, medios de pago, modalidades de entrega, fórmula de comisión, límites y
administrador inicial. Razón social, registro, dirección, correo, tasas y
credenciales pueden quedar pendientes, pero nunca se rellenan con ejemplos que
parezcan reales.

## Construcción

1. Crea una aplicación nueva desde la plantilla; no conviertas la instalación
   en un SaaS compartido.
2. Crea un proyecto Supabase propio para el negocio y aplica las migraciones.
3. Configura marca y operación como datos. Ningún componente puede contener el
   nombre, teléfono o moneda de un negocio concreto.
4. Crea las combinaciones iniciales de monedas y modalidades. Una modalidad
   desactivada permanece en el panel pero no aparece al público.
5. El cálculo del navegador es una vista previa. Recalcula en servidor usando
   la regla activa antes de guardar.
6. Incluye Cuadre en la misma aplicación: solicitudes, estados, pagos, entregas,
   costos, utilidad, referidos, comprobantes e incidencias.
7. Protege clientes y documentos con RLS. Una sesión autenticada no basta para
   acceder al panel; comprueba el rol almacenado en datos no editables por el
   usuario.
8. Permite al administrador crear trabajadores y otros administradores. Exige
   una confirmación explícita antes de conceder rol administrativo.

## Comprobaciones obligatorias

- pruebas unitarias de cada modo de comisión;
- límites mínimo y máximo en navegador y servidor;
- seis pares UYU/USD hacia USD/CUP cuando ese sea el corredor configurado;
- una tasa nueva no modifica una remesa anterior;
- idempotencia por `external_ref`;
- cliente, trabajador y administrador no pueden leer filas ajenas;
- documentos no tienen URL pública;
- comprobante descargable y vista compartible por WhatsApp;
- build de producción;
- recorrido móvil: calcular, identificarse, enviar solicitud y consultar estado.

## Publicación

Crea un proyecto Vercel y configura variables sin exponer secretos. Despliega
primero una vista previa, ejecuta la verificación funcional contra esa URL y
promueve exactamente el artefacto validado. Entrega URL, estado, commit y lista
honesta de datos pendientes.

## Límite legal

No inventes licencias ni afirmes que el negocio está autorizado o regulado.
La ausencia de datos legales no autoriza a sustituirlos con texto ficticio.
