# BETTRACK PRO

Panel web local para registrar ganancias y pérdidas, revisar el balance y exportar informes. La aplicación no realiza apuestas, no procesa dinero y no necesita una cuenta para funcionar.

## Desarrollo local

Requisitos: Node.js 18 o superior y un navegador moderno.

```bash
npm test
python3 -m http.server 8080
```

Después, abre `http://localhost:8080`. El servidor HTTP es necesario porque la aplicación usa módulos JavaScript nativos; abrir `index.html` directamente puede bloquear las importaciones del navegador.

## Estructura

- `index.html`: estructura semántica y contenido de la interfaz.
- `styles.css`: sistema visual responsive, estados de foco y preferencias de movimiento reducido.
- `app.js`: interacción del navegador, pestañas, calendario, historial y gráficos.
- `core.mjs`: validación, persistencia, cálculos, respaldos y CSV; se puede probar sin navegador.
- `tests/`: pruebas automatizadas de lógica y humo de la entrega estática.

## Compatibilidad de datos

La clave de `localStorage` continúa siendo `bettrack_public_v1`. Esto permite que la versión mejorada lea los registros creados por la versión anterior sin migración destructiva. Los registros que no cumplen el formato se ignoran al cargarse para que un elemento dañado no bloquee toda la aplicación.

Los respaldos JSON reemplazan los datos actuales solamente después de validar el archivo y pedir confirmación. Antes de restaurar o borrar, exporta un respaldo. Los datos siguen siendo locales al navegador y no se sincronizan entre dispositivos.

## Pruebas

```bash
npm test
```

Las pruebas cubren fechas reales, años bisiestos, fechas futuras, cálculo de totales y saldos, validación de cuotas y notas, importación, recuperación de almacenamiento parcialmente inválido, protección frente a fórmulas CSV y la estructura de la interfaz.

## Despliegue estático

Publica `index.html`, `styles.css`, `app.js` y `core.mjs` en la raíz de un alojamiento HTTPS que sirva archivos estáticos. No hay dependencias npm de producción, backend, claves API ni secretos en el frontend.

Para una versión comercial con cuentas y sincronización, consulta `CLOUD_PLAN.md`. Ese documento es un diseño pendiente, no una funcionalidad implementada.
