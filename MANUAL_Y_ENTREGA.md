# BETTRACK PRO — Manual de uso y entrega (v1)

## Uso
1. Abre la aplicación en un navegador moderno.
2. En **Ajustes**, configura un saldo inicial si corresponde.
3. En **Inicio**, registra una ganancia o pérdida con fecha, monto y nota.
4. Revisa **Evolución del saldo** y **Ganancias y pérdidas por mes** (últimos seis meses).
5. En **Calendario**, toca un día para ver el saldo acumulado a esa fecha.
6. En **Historial**, filtra por tipo y busca por fecha o nota. Puedes eliminar movimientos.
7. En **Ajustes**, descarga respaldos JSON y reportes CSV para hojas de cálculo.

## Privacidad y recuperación
- La app funciona sin cuenta y guarda los registros en el almacenamiento local del navegador.
- Los registros NO se sincronizan entre dispositivos.
- Antes de borrar datos del navegador o cambiar de dispositivo, descarga un respaldo JSON.
- Para recuperar registros, usa **Restaurar respaldo JSON**. La restauración reemplaza los datos locales existentes.
- Los CSV son informes; para restaurar información utiliza JSON.

## Instalación
- Requiere navegador moderno con JavaScript y almacenamiento local.
- Para instalar en alojamiento estático, coloca `index.html` en la raíz de un servidor web HTTPS.
- No requiere base de datos, backend ni claves API.
- Para personalizar nombre, colores y textos se debe editar el HTML/CSS/JS.

## Pruebas de aceptación antes de entrega comercial
- [ ] Registrar una ganancia y comprobar balance, historial, calendario y gráficos.
- [ ] Registrar una pérdida y comprobar cálculo neto.
- [ ] Probar movimientos en dos meses distintos.
- [ ] Probar filtros de historial y búsqueda por nota/fecha.
- [ ] Descargar y abrir CSV en hoja de cálculo.
- [ ] Exportar JSON y restaurarlo en un navegador de prueba.
- [ ] Cerrar y abrir la pestaña y comprobar persistencia.
- [ ] Probar en Android y escritorio, incluido teclado y tamaño de pantalla.
- [ ] Comprobar que el alojamiento HTTPS funciona sin errores de consola.
- [ ] Validar manejo de datos inválidos y almacenamiento lleno.
- [ ] Hacer revisión legal y de licencias antes de cualquier cesión exclusiva.

## Entrega de derechos y límites
El código de la demo ya ha sido público en GitHub. No puede asegurarse exclusividad retrospectiva sobre copias que terceros hayan obtenido. Una futura cesión de derechos necesita acuerdo escrito, revisión de titularidad, dependencias y condiciones precisas.

## Estado
Documentación de uso y checklist creados; pruebas manuales completas y auditoría independiente **pendientes**. No afirmar certificación, seguridad auditada ni precio de venta garantizado.
