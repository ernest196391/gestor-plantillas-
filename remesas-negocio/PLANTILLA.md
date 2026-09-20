# Plantilla de negocio de remesas

Esta plantilla crea una aplicación independiente para cada negocio de remesas.
Cada instalación tiene su propio repositorio, proyecto Supabase y despliegue en
Vercel. Incluye la web pública, el panel administrativo y un Cuadre reducido a
remesas.

## Regla de aislamiento

> Ningún fichero de código puede nombrar a un negocio concreto. La identidad,
> los contactos, las monedas, los métodos y las reglas comerciales son datos.

No se comparte una base de datos entre negocios. La plantilla no es un SaaS
multitenant: produce aplicaciones independientes para reducir el riesgo de que
un negocio vea datos de otro.

## Qué se configura por negocio

| Área | Datos |
|---|---|
| Identidad | nombre, lema, logo, colores, dominio |
| Contacto | WhatsApp, correo, dirección y datos legales |
| Cobro | monedas de origen y medios de pago aceptados |
| Entrega | moneda, modalidad, tasa, comisión y disponibilidad |
| Riesgo | mínimos, máximos y momento de verificación |
| Operación | estados, roles, referidos y comprobantes |

## Modelo monetario

La moneda y la modalidad son entidades distintas. `CUP` es una moneda;
`efectivo`, `transferencia`, `MLC` y `tarjeta Clásica` son modalidades. Una
cotización siempre une una moneda de origen con una modalidad de entrega.

Ejemplos:

- UYU → USD efectivo;
- UYU → CUP efectivo;
- UYU → CUP transferencia;
- USD → USD efectivo;
- USD → CUP efectivo;
- USD → CUP transferencia.

Cada par puede tener tasa, comisión porcentual, comisión fija, mínimo y máximo
propios. La comisión admite tres reglas: añadida al pago, descontada de la
entrega o incluida en la tasa.

## Roles

- `administrador`: crea usuarios, publica tasas y cambia configuración.
- `trabajador`: procesa remesas y actualiza estados según sus permisos.
- `cliente`: consulta sus operaciones, beneficiarios y comprobantes.

Tener sesión no concede privilegios. Los permisos viven en tablas protegidas
por RLS y nunca en metadatos editables por el usuario.

## Flujo operativo

`solicitada → pendiente_pago → pago_confirmado → procesando → enviada_cuba → entregada`

Estados terminales alternativos: `cancelada` e `incidencia`.

Cada transición guarda responsable, fecha, nota y estado anterior. Los enlaces
públicos de seguimiento usan referencias aleatorias y no exponen documentos ni
datos completos del cliente.

## Verificación y comprobantes

La primera operación requiere verificar al remitente. Los documentos se guardan
en un bucket privado. El comprobante se genera en formato descargable y en una
vista ligera compatible con WhatsApp; nunca contiene fotografías de identidad.

## Cuadre incluido

Cuadre forma parte de la instalación. Recibe las solicitudes de la landing,
evita duplicados mediante `external_ref`, registra costos e ingresos y calcula:

- monto cobrado;
- monto entregado;
- costo real;
- comisión;
- utilidad;
- comisión de referido;
- responsable de la operación.

## Publicación

La skill crea un repositorio nuevo, un proyecto Supabase nuevo y un proyecto
Vercel nuevo. Aplica las migraciones, configura variables, ejecuta pruebas y
build, despliega una vista previa, verifica el recorrido completo y solo
después publica producción.

## Fuente funcional

La implementación se deriva de `cuyana-app` para reutilizar autenticación, RLS,
seguimiento, clientes, beneficiarios, documentos, referidos e integración con
Cuadre. No se copian la tienda, el catálogo, los productos ni reglas de Guyana.
