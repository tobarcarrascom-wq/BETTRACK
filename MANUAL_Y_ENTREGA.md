# BETTRACK PRO — Manual de uso y entrega

## Uso rápido

1. Abre la aplicación en un navegador moderno mediante HTTPS o un servidor local.
2. En **Ajustes**, configura el saldo inicial si corresponde.
3. En **Inicio**, registra una ganancia o pérdida con fecha, monto y, opcionalmente, cuota y nota.
4. Revisa la evolución del saldo y el resumen mensual.
5. En **Calendario**, selecciona un día para consultar su saldo acumulado y cambio diario.
6. En **Historial**, busca por nota o fecha y filtra por tipo.
7. En **Ajustes**, exporta JSON para recuperar datos y CSV para analizarlos en una hoja de cálculo.

## Privacidad y recuperación

- Los registros permanecen en el almacenamiento local de este navegador.
- No se sincronizan entre dispositivos ni se envían a un servidor.
- Antes de borrar datos del navegador o cambiar de dispositivo, descarga un respaldo JSON.
- Restaurar un JSON reemplaza los datos locales existentes después de validar el archivo y pedir confirmación.
- Un CSV es un informe y no sirve para restaurar información.
- La aplicación no gestiona apuestas, dinero, pagos ni contraseñas.

## Desarrollo y despliegue

```bash
npm test
python3 -m http.server 8080
```

Publica `index.html`, `styles.css`, `app.js` y `core.mjs` juntos en la raíz de un servidor HTTPS. No requiere base de datos, backend ni claves API. No abras `index.html` directamente si el navegador bloquea los módulos ES; usa un servidor HTTP local.

## Checklist técnico antes de entregar

- [x] Registrar ganancias y pérdidas y comprobar el balance.
- [x] Probar cálculo de saldo al cierre de un día.
- [x] Validar fechas imposibles, fechas futuras, montos, cuotas y notas.
- [x] Probar filtros de historial y búsqueda.
- [x] Exportar JSON y CSV.
- [x] Validar restauración sin reemplazo parcial en caso de error.
- [x] Mantener la persistencia existente (`bettrack_public_v1`).
- [x] Ejecutar `npm test`.
- [ ] Ejecutar pruebas manuales en Chrome, Safari y Firefox reales.
- [ ] Ejecutar pruebas en Android/iOS y comprobar teclado, lector de pantalla y tamaños pequeños.
- [ ] Revisar consola, HTTPS y cabeceras del alojamiento.
- [ ] Hacer auditoría legal, de privacidad, licencias y seguridad independiente.

## Entrega comercial

Esta rama es una mejora de la demo local. Para una venta profesional todavía faltan cuentas, sincronización, recuperación, soporte, términos, política de privacidad, modelo de licencias, facturación y un plan de operación. No debe presentarse como servicio cloud multiusuario ni como producto financiero regulado.

El código de la demo ya fue público en GitHub, por lo que una cesión exclusiva requiere revisión legal de titularidad y alcance. No incluir credenciales en el repositorio ni en los respaldos de usuario.
