# BETTRACK PRO — Producto de seguimiento financiero

## Estado actual

BETTRACK PRO es una aplicación web estática y responsive para registrar movimientos financieros informativos. En esta rama se mantiene el alcance local de la versión pública y se refuerzan su calidad de producto, validación y mantenibilidad.

**Demo pública existente:** https://tobarcarrascom-wq.github.io/BETTRACK/

### Funciones conservadas

- Registro de ganancias y pérdidas con fecha, monto, cuota informativa y nota.
- Balance total, resultado neto y resumen de ganado/perdido.
- Calendario con cambio diario y saldo acumulado al cierre de cada día.
- Historial con búsqueda, filtro por tipo y eliminación confirmada.
- Gráfico de evolución del saldo y resumen mensual de seis meses.
- Saldo inicial configurable.
- Exportación JSON, restauración validada y reporte CSV.
- Persistencia local en el navegador.

### Mejoras realizadas en esta rama

- Separación de HTML, CSS, interacción y lógica de dominio.
- Validación de fechas de calendario reales, años bisiestos y fechas futuras.
- Validación consistente de monto, cuota, nota, identificadores y respaldos.
- Recuperación tolerante ante almacenamiento local parcialmente dañado.
- Confirmación antes de reemplazar o borrar información.
- Protección contra fórmulas al generar CSV.
- Sistema visual responsive con estados de foco visibles, `aria-live`, pestañas semánticas y soporte para `prefers-reduced-motion`.
- Mensajes de estado para guardado, restauración, eliminación y errores de almacenamiento.
- Pruebas automatizadas con Node.js sin dependencias externas.

## Límites actuales

- No hay autenticación, cuentas, sincronización en nube ni base de datos remota.
- Los datos se guardan en el navegador; borrar el almacenamiento del sitio puede eliminarlos.
- La versión pública del código ya existe en GitHub; no puede prometerse exclusividad retrospectiva sobre copias que terceros hayan obtenido.
- No hay auditoría de seguridad independiente, revisión legal ni certificación financiera.
- No hay analítica, soporte, facturación, control de licencias ni panel administrativo.
- No incluye procesamiento de pagos, apuestas ni transacciones financieras.

## Producto comercial propuesto

La base actual es adecuada como demo local o herramienta personal. Para vender un servicio profesional se debe construir una edición separada con autenticación, sincronización, recuperación de cuenta, controles de acceso, copias de seguridad, soporte y política de privacidad. El diseño técnico inicial está documentado en `CLOUD_PLAN.md`.

## Recomendación de entrega

1. Revisar titularidad, licencias y condiciones de cesión con asesoría legal.
2. Crear repositorio privado para la edición comercial y mantener esta demo como referencia pública.
3. Implementar backend de prueba separado de producción, con pruebas de aislamiento de datos.
4. Ejecutar pruebas de navegador, móviles, accesibilidad y carga antes de cobrar a usuarios.
5. Definir modelo de negocio, costos de infraestructura, soporte, límites de uso, SLA y procedimiento de incidentes.

No se ha realizado ninguna compra, pago ni publicación adicional como parte de este trabajo.
