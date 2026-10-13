# Теория CI/CD (Этап 1)

Краткий конспект по CI/CD для проекта React-компонентов с релизным процессом.

---

## 1. Основы CI/CD

### Continuous Integration (CI)

Непрерывная интеграция — практика, при которой каждый коммит автоматически проверяется сборкой и тестами. Цель — быстро находить ошибки при слиянии кода.

Ключевые элементы:

- единый источник кода (git);
- автоматический запуск сборки и тестов на каждый push/PR;
- быстрая обратная связь разработчику;
- стабильный основной ветка (main).

### Continuous Delivery (CD)

Непрерывная доставка — код после прохождения всех проверок **автоматически готов к релизу**, но публикация в прод выполняется **вручную** (один клик/подтверждение).

### Continuous Deployment

Непрерывное развёртывание — то же самое, что Continuous Delivery, но публикация в прод происходит **полностью автоматически** после прохождения всех проверок, без ручного подтверждения.

### Разница Delivery vs Deployment

|                   | Continuous Delivery | Continuous Deployment     |
| ----------------- | ------------------- | ------------------------- |
| Публикация в прод | вручную             | автоматически             |
| Когда             | код всегда готов    | код сразу уходит в прод   |
| Риск              | ниже                | выше, нужны сильные тесты |

### Общая схема пайплайна

```
commit → build → lint/typecheck → unit-тесты → e2e/visual → релиз → деплой
```

---

## 2. GitLab CI

### `.gitlab-ci.yml`

Главный конфиг пайплайна в корне репозитория. Минимальный пример:

```yaml
stages:
  - build
  - test

build:
  stage: build
  script:
    - npm ci
    - npm run build

test:
  stage: test
  script:
    - npm test
```

### Stages и Jobs

- **Stage** — этап пайплайна; этапы идут последовательно, а jobs внутри одного этапа — параллельно.
- **Job** — отдельная задача (build, test, deploy) со своими `script`, `stage`, условиями.

### Scripts

- `script` — основная команда job'а; job падает, если любая команда завершилась с ненулевым кодом.
- `before_script` — подготовка (установка зависимостей, кэш).
- `after_script` — очистка, артефакты логов.

### Runners

Исполнители jobs. Бывают:

- **shared** — общие для всей инстанции;
- **group/project** — выделенные группе или проекту;
- **shell** / **docker** / **kubernetes** — тип окружения.

Метки runner'а (`tags`) назначают job на нужный исполнитель.

### Artifacts и Cache

- **Artifacts** — файлы, которые job передаёт последующим jobs (например, собранный dist, отчёты тестов). Настраиваются через `artifacts: paths`.
- **Cache** — кэш зависимостей между запусками (например, `node_modules`), ускоряет установку. Настраивается через `cache: paths`.

### Variables

Переменные окружения: predefined (`CI_COMMIT_BRANCH`, `CI_MERGE_REQUEST_ID`) и пользовательские (в настройках проекта или в yaml). Секреты хранятся в CI/CD Variables с флагом Masked.

### Rules и dependencies

- **rules** — условия запуска job (по ветке, событию, изменениям файлов):

```yaml
deploy:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

- **dependencies** / **needs** — контроль передачи артефактов и порядка выполнения jobs.

### Ручные и автоматические jobs

- **Manual job** — `when: manual`; запускается только по подтверждению (например, деплой в прод).
- **allow_failure: true** — job может упасть, не останавливая пайплайн (обычно для manual).

---

## 3. GitHub Actions

### Концепция

- **Workflow** — yaml-файл в `.github/workflows/`, описывающий процесс.
- **Event** — событие, запускающее workflow (`push`, `pull_request`, `workflow_dispatch`, `schedule`).
- **Job** — набор шагов на одном runner'е; jobs по умолчанию идут параллельно.
- **Step** — отдельное действие: shell-команда или используемый **action** (`actions/checkout`, `actions/setup-node`).

Минимальный пример:

```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
```

### Runers

- **Hosted** (ubuntu-latest, windows-latest, macos-latest) — управляемые GitHub, ограничены по времени/ресурсам.
- **Self-hosted** — свои машины; нужны для специфичного окружения (например, фиксированные шрифты для скриншотных тестов).

### Actions

Готовые reusable-шаги из Marketplace или свои (`uses: ./.github/actions/...`). Популярные: `checkout`, `setup-node`, `upload-artifact`, `cache`, `deploy-pages`.

### Artifacts и Cache

- **Artifacts** — `actions/upload-artifact` / `download-artifact`: передача файлов между jobs и скачивание при падении (логи, скриншоты, trace).
- **Cache** — `actions/cache` или `cache:` в `setup-node`: кэширование `node_modules`, `~/.npm`.

### Secrets, permissions, environments

- **Secrets** — зашифрованные значения (npm token, GITHUB_TOKEN); доступны как `${{ secrets.NAME }}`; не попадают в логи.
- **Permissions** — минимальные права токена workflow:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

- **Environments** — именованные окружения (production) с правилами защиты: required reviewers, wait timer, branch policies.

### Триггеры

- **`push`** — на коммит в указанную ветку (обычно main после merge).
- **`pull_request`** — на открытие/обновление PR (безопасно: работает с кодом PR, secrets недоступны из fork'ов).
- **`workflow_dispatch`** — ручной запуск из UI с опциональными input-параметрами (удобно для beta-релизов).

### needs, матрицы, условия

- **needs** — зависимости jobs (job ждёт завершения указанных):

```yaml
publish:
  needs: [lint, test, build]
```

- **Матрицы** — прогон на нескольких версиях/ОС:

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
```

- **Условия** — `if:` на job/step:

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### Публикация пакетов и статических сайтов

- **Пакеты (npm)** — `npm publish` с `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`; часто отдельным job'ом после успешных проверок, с guard'ом на существование версии.
- **Статические сайты (GitHub Pages)** — официальный механизм: `actions/upload-pages-artifact` + `actions/deploy-pages`, permissions `pages: write` и `id-token: write`, environment `github-pages`.

---

## 4. Сравнение: GitLab CI vs GitHub Actions

| Понятие         | GitLab CI                      | GitHub Actions                          |
| --------------- | ------------------------------ | --------------------------------------- |
| Конфиг          | один `.gitlab-ci.yml`          | несколько `.github/workflows/*.yml`     |
| Этапы           | явные `stages`                 | нет stages, только jobs + `needs`       |
| Параллельность  | jobs в одном stage параллельно | jobs параллельно по умолчанию           |
| Условия запуска | `rules:`                       | `on:` + `if:`                           |
| Ручной запуск   | `when: manual`                 | `workflow_dispatch`                     |
| Runner'ы        | свои / shared / Kubernetes     | hosted / self-hosted                    |
| Артефакты       | `artifacts:`                   | `upload-artifact` / `download-artifact` |
| Кэш             | `cache:`                       | `actions/cache`                         |
| Секреты         | CI/CD Variables                | Secrets + Environments                  |
| Реестр пакетов  | GitLab Package Registry        | GitHub Packages / npm                   |
| Pages           | GitLab Pages                   | GitHub Pages                            |

### Когда что выбирать

- **GitLab CI** — когда весь цикл (код, ревью, CI/CD) живёт в GitLab; удобен для monorepo и сложных stage-пайплайнов.
- **GitHub Actions** — когда проект на GitHub; богатый Marketplace, простая интеграция с Pages/Packages, гибкие матрицы и reusable workflows.

Для данного проекта выбран **GitHub Actions** (репозиторий и Pages на GitHub).

---

## 5. SemVer и Changesets

### Semantic Versioning (SemVer)

Версия вида `MAJOR.MINOR.PATCH` (например, `1.4.2`):

- **MAJOR** — несовместимые изменения публичного API (удаление/переименование props, изменение поведения);
- **MINOR** — новая обратно совместимая функциональность (новый prop с дефолтом, новый компонент);
- **PATCH** — обратно совместимые исправления багов

До `1.0.0` часто используют `0.x.y`: API считается нестабильным, даже minor может ломать.

Пререлизы: `1.2.0-beta.1`, `1.2.0-beta.2` — prerelease-версии, npm по умолчанию не стабильным тегом `latest`.

### Changesets

Инструмент для управления версиями и changelog в монорепо/библиотеках.

Основные команды:

- `npx changeset` — создать changeset: выбор затронутых пакетов, уровень bump (patch/minor/major) и описание изменения; changeset — это markdown-файл в `.changeset/`, коммитится в git.
- `npx changeset version` — применить changesets: обновить `package.json` версии, записать changelog, удалить использованные changeset-файлы.
- `npx changeset publish` — опубликовать пакеты в registry (npm), пропуская уже существующие версии; ставит теги git.

### Changesets action (релизный PR flow)

Стандартная схема:

1. Разработчик добавляет changeset к PR.
2. После merge в main special job (changesets/action) создаёт/обновляет **Release PR** с обновлёнными версиями и changelog.
3. При merge Release PR запускается публикация в npm.

Это исключает циклические запуски: обычный merge не публикует, публикация — только после merge Release PR.

### Beta-релизы (prerelease)

Changesets поддерживает prerelease-режим:

```bash
npx changeset pre enter beta
npx changeset version   # версии вида 1.2.0-beta.0
npx changeset publish --tag beta
```

- `pre enter beta` — включить режим; накопленные changesets станут beta-версиями.
- `pre exit` — выйти из режима перед следующим stable-релизом.
- npm-тег `beta` не перетирает `latest` — стабильная аудитория не получает prerelease.

Разделение beta/stable по тегам/версиям и отдельным secrets/workflows не даёт beta-workflow опубликовать stable-версию.

---

## Схема CI/CD будущей библиотеки

```
Feature branch
      │
      ▼
┌─────────────────────────────┐
│  PR → CI workflow           │
│  install → lint/typecheck   │
│  → build → unit → visual    │
└──────────────┬──────────────┘
               │ merge в main (после green CI)
               ▼
┌─────────────────────────────┐
│  push to main               │
│  ├─ changesets → Release PR │
│  ├─ deploy Storybook→Pages  │
│  └─ (после merge Release PR)│
│      → npm publish stable   │
└─────────────────────────────┘

Ручной запуск (workflow_dispatch)
      └─→ beta: pre enter beta → version → publish --tag beta
```
