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

## Beta-релиз (ветка `next`)

Beta публикуется **из ветки `next`** — отдельной долгоживущей prerelease-ветки. `main` beta-workflow не трогает, прямых push в `main` нет, Rulesets не ослабляются.

Распределение ответственности:

| Где выполняется                | Что                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Разработчик, локально в `next` | `changeset pre enter beta` (однократно), `npm run changeset`, **`changeset version`** + коммит версий                      |
| CI, на push в `next`           | проверки (lint/typecheck/unit/visual/build) и **`changeset publish --tag beta --no-git-tag`** — без git-записей и без push |

### 1. Создание ветки `next` (однократно)

```bash
git fetch origin
git checkout -b next origin/main
npx changeset pre enter beta          # создаёт .changeset/pre.json — коммитится только в next
git add .changeset/pre.json
git commit -m "chore: enter beta prerelease mode"
git push -u origin next
```

Push в `next` запускает workflow **Beta release**; первый запуск упадёт на guard'е «версия не prerelease» — это ожидаемо, пока не выполнено `changeset version`.

### 2. Добавление changesets

В `next` (или в feature-ветке с merge в `next`): `npm run changeset` → коммитить markdown из `.changeset/` вместе с кодом.

### 3. Подготовка публикации (version — руками, в `next`)

```bash
npx changeset version    # X.Y.Z-beta.N+1, changelog; changesets архивируются в .changeset/pre/
git commit -am "chore(release): X.Y.Z-beta.N+1"
git push                 # push в next → CI публикует
```

`changeset version` в prerelease-режиме увеличивает только prerelease-суффикс (`0.1.0-beta.0` → `0.1.0-beta.1`), потреблённые changesets переносятся в `.changeset/pre/` (нужны для финальной стабильной версии).

### 4. Публикация (CI)

Workflow на push в `next`:

1. Guard'ы: есть `pre.json` с тегом `beta`; версия в `package.json` — prerelease с суффиксом `-beta`; нет неза-version'нутых changesets в `.changeset/*.md` (иначе — понятная ошибка с инструкцией);
2. проверки и сборка;
3. `changeset publish --tag beta --no-git-tag` — публикует только непубликованные версии (идемпотентно), dist-tag `beta`, `latest` не затрагивается, git-операций нет (`permissions: contents: read`).

Ручной запуск: Actions → **Beta release** → Run workflow (ветка `next`); опция `dry_run` — только проверки и tarball-артефакт.

### 5. Установка beta

```bash
npm install @matushini97/clover-view-ui@beta
```

`npm install @matushini97/clover-view-ui` без тега продолжает ставить стабильную версию (`latest`).

### 6. Завершение prerelease → стабильный релиз

Выполняется **вручную**, автоматического merge `next` → `main` нет:

```bash
# в ветке next
npx changeset pre exit    # выйти из prerelease-режима
npx changeset version     # X.Y.Z-beta.N → X.Y.Z (архив .changeset/pre/ применяется повторно)
git commit -am "chore(release): X.Y.Z"
git push
```

Затем PR `next` → `main` (в нём НЕ должно остаться `.changeset/pre.json` — после `pre exit` + `version` он удаляется) и публикация `latest` из `main` по stable-процессу.

### Гарантии разделения beta / stable

|           | beta                                           | stable                           |
| --------- | ---------------------------------------------- | -------------------------------- |
| Ветка     | `next`                                         | `main`                           |
| Триггер   | push в `next` (+ ручной dispatch)              | push/merge в `main` (Release PR) |
| npm-тег   | `beta`                                         | `latest`                         |
| Версия    | `X.Y.Z-beta.N`                                 | `X.Y.Z`                          |
| pre-режим | `pre.json` с `"tag": "beta"` (только в `next`) | pre-режим выключен               |
| git push  | не выполняется (`contents: read`)              | не выполняется в обход PR        |

## Git-теги и GitHub Releases

Beta-публикации идут с `--no-git-tag` (без git-тегов). Git-теги `@matushini97/clover-view-ui@<version>` и GitHub Releases создаются на stable-релизах.

## Secrets

Для публикации в npm нужен `NPM_TOKEN` (Automation token с правами publish на scoped-пакет) в secrets репозитория. Beta-workflow использует `permissions: contents: read` — записей в git нет.

## Ручные команды (локально)

```bash
npm run changeset        # добавить changeset
npx changeset pre enter beta  # включить prerelease-режим (в next)
npx changeset version    # применить changesets: версии + changelog
npx changeset publish --tag beta --no-git-tag  # публикация (обычно делает CI)
```
