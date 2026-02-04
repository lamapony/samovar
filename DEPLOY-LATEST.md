# Деплой Samovar с новым логотипом

## Проект собран с новой айдентикой!

Файлы готовы в папке `dist/`:
- ✅ Новый логотип (logo.svg, logo-icon.svg)
- ✅ Identity система (identity.css)
- ✅ Обновленные хедеры на всех страницах
- ✅ Favicon

## Быстрый деплой на Netlify

### Вариант 1: Git + Netlify (рекомендуется)

Проект уже в репозитории: https://github.com/lamapony/samovar

1. Зайди на https://app.netlify.com/
2. **"Add new site"** → **"Import an existing project"**
3. Выбери GitHub → репозиторий **lamapony/samovar**
4. Настройки:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Deploy site**
6. Domain settings → Add custom domain → `samovar.dk`

### Вариант 2: Drag & Drop (прямо сейчас)

```bash
# Сначала скопируй dist куда-нибудь
cp -r /Users/dmitriibabinov/headpage/samovar/dist ~/Desktop/samovar-dist
```

1. Открой https://app.netlify.com/drop
2. Перетащи папку `samovar-dist` в браузер
3. Получишь ссылку вида https://random-name.netlify.app
4. В настройках добавь свой домен samovar.dk

## Что нового

### Логотип
- Минималистичный самовар в виде геометрической иконки
- Текст "Samovar" шрифтом Georgia (serif)
- Подзаголовок "RUSSISK SPROGKURSUS"
- Цвета: тёмный (#1a1a1a) + тёплый акцент (#8B4513)

### Цветовая схема
- Фон: тёплый белый (#FAF9F7)
- Текст: глубокий чёрный (#1a1a1a)
- Акцент: тёплый коричневый (#8B4513)
- Границы: мягкие, тёплые тона

### Типографика
- Заголовки: Georgia (serif) — элегантность и взрослость
- Текст: Inter (sans-serif) — читаемость
- Размеры: увеличены для комфортного чтения

### UI элементы
- Хедер: sticky с тенью
- Кнопки: чёткие, с закруглением 6px
- Карточки: мягкая тень, белый фон
- Hover: только цвет и тень, без анимаций

## Проверка после деплоя

- [ ] Логотип виден на всех страницах
- [ ] Навигация работает (Kursus, Kasus, Fonetik, Ordbog)
- [ ] Цвета тёплые, не холодные
- [ ] Текст читаемый
- [ ] samovar.dk работает

## Обновление в будущем

После любых изменений:
```bash
cd /Users/dmitriibabinov/headpage/samovar
npm run build
# Затем деплой новой dist/ папки
```

Если используешь Git + Netlify — сайт обновится автоматически при push!
