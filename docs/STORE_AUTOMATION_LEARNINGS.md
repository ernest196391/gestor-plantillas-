# Blueprint de tiendas — aprendizajes acumulados

Este documento es la memoria operativa para que Gestor pueda generar tiendas y centros de control sin repetir fallos.

## Reglas obligatorias
- Assets web servidos desde `public/`; test de existencia de cada ruta visual.
- Configuración por tenant: marca, logo, colores, moneda, locale, WhatsApp, dirección, prefijo y tarifas.
- Guardar pedido antes de abrir WhatsApp.
- Referencia única e idempotencia.
- Seguimiento por referencia + teléfono; no filtrar PII.
- RLS + auditor de seguridad después de migraciones; revisar especialmente SECURITY DEFINER.
- Admin: Supabase Auth + allowlist/rol, nunca “cualquier usuario autenticado”.
- Recuperación de contraseña no enumera correos.
- Estados de pedido compartidos entre base y UI.
- Tarifas desde fuente canónica; nunca inventarlas.
- Mobile-first y copy orientado a acciones.
- Cierre de bloque = código + pruebas + deployment READY + prueba de persistencia cuando corresponda.

## Fallos reales que originaron estas reglas
1. Hero guardado fuera de `public/` → 404 aunque el código parecía correcto.
2. Flujo de compra basado en WhatsApp → no existía pedido persistente.
3. RLS habilitado pero RPC SECURITY DEFINER ejecutable anónimamente → exposición indirecta.
4. Configuración comercial hardcodeada → imposible reutilizar correctamente el template.
5. Mensajes heredados de otra marca → fuga de identidad white-label.
6. Confirmar “terminado” antes de verificar producción → estados engañosos.
7. En CUYANA, una política de lectura hacía invisibles filas vencidas incluso para el proceso que debía renovarlas; además un update podía devolver éxito tocando cero filas. Regla: verificar filas afectadas y diseñar RLS según cada actor.

## Meta
Convertir estas reglas en un pipeline: prompt → manifiesto tenant → infraestructura → storefront → checkout → pedido → seguimiento → admin → auditoría → deploy.
