# BETTRACK PRO Cloud — Plan de cuentas y sincronización

Estado: **diseño técnico**. No hay servicio Supabase conectado, cuentas creadas ni sincronización desplegada.

## Objetivo
Cada usuario debe poder acceder a sus propios movimientos financieros desde varios dispositivos sin acceder a datos ajenos. La demo estática actual debe seguir funcionando sin modificaciones disruptivas.

## Arquitectura
- Frontend: aplicación web estática servida por HTTPS.
- Identidad: Supabase Auth (correo y contraseña o enlace de acceso, verificación de correo y recuperación).
- Datos: PostgreSQL administrado en Supabase.
- Control de acceso: RLS (Row Level Security) obligatoria por propietario autenticado.
- Cliente: supabase-js con clave pública anon/publishable; **nunca** incluir service_role, secretos ni contraseñas en frontend o GitHub.
- Despliegue inicial: entorno de pruebas separado de producción; producción requiere validación de políticas y presupuesto.

## Modelo de datos propuesto
```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movement_date date not null,
  kind text not null check (kind in ('gain','loss')),
  amount_clp bigint not null check (amount_clp > 0),
  note text not null default '' check (char_length(note) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index movements_user_date_idx on public.movements(user_id,movement_date);
alter table public.profiles enable row level security;
alter table public.movements enable row level security;
create policy "profiles own read" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles own insert" on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles own update" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "movements own select" on public.movements for select to authenticated using (user_id = (select auth.uid()));
create policy "movements own insert" on public.movements for insert to authenticated with check (user_id = (select auth.uid()));
create policy "movements own update" on public.movements for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "movements own delete" on public.movements for delete to authenticated using (user_id = (select auth.uid()));
```

## Pendientes de diseño
- El saldo inicial debe residir en tabla propia con política RLS.
- Elegir cómo resolver conflictos offline: versiones por registro y último cambio confirmado, nunca sobrescritura silenciosa.
- Migración de registros localStorage a UUIDs y detección de duplicados.
- Manejar expiración de sesión y reintentos sin perder cambios locales.
- Límites de tasa, monitoreo, copias de seguridad y políticas de retención.
- Eliminación de cuenta y todos sus datos con flujo autenticado en servidor.
- Revisión de privacidad y términos antes de comercializar.

## Secuencia de implementación
1. Crear proyecto Supabase de **pruebas** bajo cuenta del propietario.
2. Configurar URL permitidas y Auth; comprobar confirmación y recuperación de correo.
3. Aplicar migraciones SQL en proyecto de pruebas.
4. Probar con dos cuentas distintas: ninguna puede leer, crear, editar ni borrar registros ajenos, incluso manipulando solicitudes.
5. Crear UI de registro/inicio/cierre de sesión sin retirar el modo local.
6. Implementar CRUD remoto, estados de carga, errores y sincronización segura.
7. Importar JSON/localStorage mediante vista previa, copia de seguridad y confirmación.
8. Probar conexión intermitente, dos dispositivos, conflicto y eliminación de cuenta.
9. Separar demo pública del código de futura versión comercial y preparar despliegue.

## Criterios de aceptación
- No se guardan contraseñas en código ni repositorios.
- RLS activada y pruebas de aislamiento satisfactorias.
- Datos recuperables al iniciar sesión en otro dispositivo.
- Ningún dato local se borra antes de verificar su migración.
- Se documentan costos y límites del servicio antes de producción.

Este documento es un plan, no evidencia de implementación o auditoría.
