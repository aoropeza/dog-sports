# canine-sports-2

Monorepo con la app Next.js (`app/`) y la infraestructura AWS CDK (`infrastructure/`). Ver [CLAUDE.md](CLAUDE.md) para detalles de arquitectura y comandos.

## Reglas de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/): el mensaje empieza con un tipo, seguido de dos puntos y una descripción breve en modo imperativo.

```
<tipo>: <descripción>
```

Tipos permitidos:

- `feat`: nueva funcionalidad
- `fix`: corrección de un bug
- `chore`: tareas de mantenimiento (dependencias, config, infra) que no cambian código de producto
- `refactor`: cambio de código que no añade funcionalidad ni corrige bugs
- `docs`: cambios solo de documentación
- `test`: agregar o corregir tests
- `style`: cambios de formato (espacios, punto y coma, etc.) sin efecto en la lógica

Ejemplos:

```
feat: agregar autenticación con Google
fix: corregir cálculo de distancia en el mapa de carrera
chore: actualizar dependencias de next
docs: agregar reglas de commit al README
```

Reglas generales:

- Un commit, un cambio lógico — evita mezclar features y fixes no relacionados.
- Descripción en minúscula, sin punto final, en modo imperativo ("agregar", no "agregado" ni "agrega").
- Si el cambio no es evidente por el diff, agrega un cuerpo explicando el *por qué*, no el *qué*.
- Nunca uses `--no-verify` para saltar hooks salvo instrucción explícita.
