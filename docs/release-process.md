# Релизный процесс

Релизы управляются через [Changesets](https://github.com/changesets/changesets). Registry — публичный npm (`registry.npmjs.org`, см. `.npmrc`).

## SemVer

Версия `MAJOR.MINOR.PATCH`:

| Уровень   | Когда                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| **patch** | исправления багов, не меняющие публичный API                                                |
| **minor** | новая обратно совместимая функциональность (новый компонент/prop с дефолтом)                |
| **major** | несовместимые изменения публичного API (удаление/переименование props, изменение поведения) |

Проект в `0.x.y`: пока API не объявлен стабильным, minor может содержать ломающие изменения — но это всё равно фиксируется changeset'ом явно.

## Как добавить changeset

1. Измените код.
2. `npm run changeset` — выбрать пакет, уровень (patch/minor/major), описание.
3. Закоммитьте markdown-файл из `.changeset/` вместе с кодом.

Изменения без changeset блокируются review-процессом: если PR меняет `src/`, публичный API или стили — changeset обязателен.

## Stable-релиз (основной flow)

1. В feature-ветке добавлен changeset.
2. PR проходит CI (lint/typecheck/build/unit/visual).
3. Merge в `main`.
4. Workflow **Release** (push в `main`) запускает changesets/action:
   - если есть необработанные changesets — создаёт/обновляет **Release PR** с новыми версиями и changelog;
   - после merge самого Release PR публикует пакет в npm (`latest`) и ставит git-тег.
5. Повторная публикация существующей версии пропускается (changeset publish идемпотентен).

Обычный merge в `main` **не публикует** напрямую — только обновляет Release PR. Публикация происходит при merge Release PR. Циклические запуски исключены: workflow проверяет наличие готовых changesets.

## Beta-релиз (ручной)

Триггер — только `workflow_dispatch` (кнопка в Actions), stable-workflow beta не запускает.

Режим prerelease Changesets:

```bash
npx changeset pre enter beta   # включить beta-режим (создаёт .changeset/pre.json — коммитится)
npm run changeset              # накопить changesets (при необходимости)
npm run version-packages       # версии вида X.Y.Z-beta.N + changelog
npm run release -- --tag beta  # publish с npm-тегом beta (latest не затрагивается)
```

После beta:

- **вернуться к stable**: `npx changeset pre exit` → `npm run version-packages` (накопленные changesets становятся стабильной версией) → merge Release PR → публикация `latest`;
- **ещё beta**: оставаться в режиме, следующий version даст `X.Y.Z-beta.N+1`.

### Гарантии разделения beta / stable

|           | beta                          | stable                           |
| --------- | ----------------------------- | -------------------------------- |
| Триггер   | только `workflow_dispatch`    | push/merge в `main` (Release PR) |
| npm-тег   | `beta`                        | `latest`                         |
| Версия    | `X.Y.Z-beta.N`                | `X.Y.Z`                          |
| pre-режим | `pre.json` с `"mode": "beta"` | pre-режим выключен               |

`changeset publish` в beta-режиме публикует только с тегом `beta` и не создаёт стабильных версий; stable-workflow не запускается из beta-workflow.

## Git-теги и GitHub Releases

Каждая публикация (beta и stable) создаёт git-тег `@matushini97/clover-view-ui@<version>`; stable дополнительно оформляется GitHub Release с changelog.

## Secrets

Для публикации в npm нужен `NPM_TOKEN` (Automation token с правами publish на scoped-пакет) в secrets репозитория. Beta- и stable-workflows используют минимально необходимые `permissions` (`contents: write`, `id-token: write` для provenance).

## Ручные команды (локально)

```bash
npm run changeset        # добавить changeset
npm run version-packages # применить changesets: версии + changelog
npm run release          # build + changeset publish (нужен npm login/token)
```
