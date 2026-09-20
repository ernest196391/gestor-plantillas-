# Modelo de datos mínimo

## Configuración

- `business_config`: identidad, contactos y opciones de la instalación.
- `source_currencies`: monedas que el cliente puede entregar.
- `payment_methods`: transferencia, efectivo u otros medios de cobro.
- `payout_methods`: forma y moneda en que recibe el beneficiario.
- `rate_rules`: par origen/destino, tasa, comisión, límites y vigencia.
- `rate_history`: historial inmutable de cambios publicados.

## Personas y permisos

- `profiles`: perfil mínimo del usuario autenticado.
- `staff_members`: rol `admin` o `worker`, estado y permisos.
- `customers`: datos y estado de verificación del remitente.
- `beneficiaries`: familiares o receptores asociados al cliente.
- `referrers`: código y regla de comisión.

## Operación

- `remittances`: instantánea completa de la regla monetaria aceptada.
- `remittance_status_events`: historial de estados y responsable.
- `payments`: evidencia y confirmación del cobro en Uruguay.
- `payouts`: evidencia de la entrega en Cuba.
- `expenses`: costo operativo asociado a la remesa.
- `referral_commissions`: comisión devengada y pagada.
- `receipts`: versión y metadatos del comprobante.
- `audit_log`: cambios administrativos sensibles.

## Invariantes

1. El servidor recalcula tasa, comisión y límites antes de crear la remesa.
2. La remesa guarda una instantánea; cambiar la tasa no altera operaciones previas.
3. Solo un administrador publica reglas o crea personal.
4. Un trabajador nunca puede elevar su propio rol.
5. Los documentos viven en almacenamiento privado.
6. Todas las tablas expuestas tienen RLS y políticas por propiedad o rol.
7. Las funciones privilegiadas no conservan `EXECUTE` para `PUBLIC`.
8. `external_ref` es único para impedir duplicados.
