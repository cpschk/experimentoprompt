---
name: oportunidades
description: Identifica oportunidades de mejora en el proyecto analizando planificación, código y dependencias. Activa cuando el usuario diga "oportunidades de mejora", "gaps", "qué mejorar", "identifica mejoras", "analiza el proyecto", "siguientes pasos".
---

# Skill: Oportunidades de Mejora

## Flujo de análisis

### 1. Buscar documentos de planificación

Revisar en orden:

| Prioridad | Documento | Ruta |
|---|---|---|
| 1 | ROADMAP | `project-context/ROADMAP.md` |
| 2 | PRODUCT_BACKLOG | `project-context/PRODUCT_BACKLOG.md` |
| 3 | GAPS (análisis previo) | `docs/GAPS.md` |
| 4 | ARCHITECTURE | `docs/ARCHITECTURE.md` |

Si existen: leer su contenido como contexto base.
Si no existen: inferir gaps analizando estructura de carpetas, TODO/FIXME en código, tests fallidos, dependencias desactualizadas.

### 2. Analizar código fuente

Buscar evidencia adicional en:
- `grep "TODO\|FIXME\|HACK\|todo"` en archivos `*.{ts,tsx,js,mjs}`
- Archivos de test: `**/*.test.{ts,tsx}`
- `package.json` para dependencias
- Estructura de `app/api/` para mapear endpoints
- `lib/` para servicios cliente

### 3. Priorizar con matriz impacto × esfuerzo × roadmap × dependencias

```
Prioridad = Impacto × (5 - Esfuerzo) × AlineaciónRoadmap × FactorDependencias
```

Donde:
- **Impacto**: 1=bajo, 5=máximo
- **Esfuerzo**: 1=mínimo, 5=máximo
- **AlineaciónRoadmap**: 0=no alineado, 1=parcial, 2=directo
- **FactorDependencias**: 1.5 si es prerequisito de otros, 1.0 normal, 0.5 si depende de muchos

### 4. Generar 3-5 oportunidades

Cada oportunidad debe incluir:

| Campo | Descripción |
|---|---|
| **Gap** | Problema concreto detectado |
| **Impacto** | 🔴 Crítico / 🔴 Alto / 🟡 Medio / 🟢 Bajo |
| **Esfuerzo** | Tiempo estimado |
| **Archivos** | Rutas a modificar/crear |
| **Dependencias** | Oportunidades que deben ejecutarse antes |
| **Criterios de éxito** | Cómo verificar que está completo |
| **Riesgos** | Qué puede salir mal |
| **Alineación roadmap** | Milestone e ID del backlog |

### 5. Guardar resultado

Escribir análisis en `docs/GAPS.md` y registrar en `opencode.json` si no está ya:

```json
"instructions": ["AGENTS.md", "docs/playbook-pod-ia.md", "docs/GAPS.md"]
```

### 6. Preguntar al usuario

```
¿Deseas proceder con alguna oportunidad? (Número / no):
```

Si responde un número, ejecutar plan detallado para esa oportunidad.

## Referencias

- `docs/GAPS.md` — Análisis previo guardado (cargar como contexto)
- `project-context/ROADMAP.md` — Milestones y timeline
- `project-context/PRODUCT_BACKLOG.md` — Features priorizadas
- `docs/ARCHITECTURE.md` — Decisiones técnicas y flujos
- `opencode.json` — Instrucciones cargadas automáticamente
