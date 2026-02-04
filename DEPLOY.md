# Деплой Samovar на samovar.dk

## Проект уже собран!

Папка `dist/` готова к деплою. Размер: ~5MB

## Варианты деплоя:

### Вариант 1: Через Netlify CLI (быстрый)

```bash
cd /Users/dmitriibabinov/headpage/samovar
npx netlify deploy --prod --dir=dist
```

После первого деплоя:
1. Зайди в Netlify Dashboard
2. Найди сайт
3. Domain settings → Add custom domain → samovar.dk
4. Подтверди DNS настройки

### Вариант 2: Через Git + Netlify (рекомендуется)

```bash
# Создать отдельный репозиторий
cd /Users/dmitriibabinov/headpage/samovar
git init
git add .
git commit -m "Initial Samovar commit"

# Создать репо на GitHub и запушить
git remote add origin https://github.com/YOUR_USERNAME/samovar.git
git push -u origin main
```

Затем в Netlify:
1. "Add new site" → "Import an existing project"
2. Выбрать GitHub репозиторий
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Добавить домен samovar.dk

### Вариант 3: Ручная загрузка (drag & drop)

1. Открыть https://app.netlify.com/drop
2. Перетащить папку `samovar/dist/` в браузер
3. Готово!
4. Затем в настройках добавить домен samovar.dk

## DNS настройки для samovar.dk

Если домен у тебя:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: samovar.dk
```

Или используй Netlify DNS (рекомендуется для HTTPS).

## Проверка после деплоя

- [ ] https://samovar.dk открывается
- [ ] Все картинки загружаются
- [ ] Все страницы работают
- [ ] HTTPS включён

## Структура dist/

```
dist/
├── index.html              # Главная
├── cases.html              # Кейсы
├── dictionary.html         # Словарь
├── phonetics.html          # Фонетика
├── css/                    # Стили
├── js/                     # Скрипты
├── images/                 # Картинки
├── lessons/                # Уроки
├── beginner/               # Начинающим
└── articles/               # Статьи
```

Всё готово к деплою! 🚀
