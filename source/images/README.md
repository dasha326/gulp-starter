# Папка для картинок

1. Все названия пишутся латиницей в нижнем регистре, разделяются тире и должны быть понятны по смыслу.
2. Допускается добавление необходимых по смыслу папок.
3. Допускается в отдельных папках использовать только числа.
4. **Не стоит** для каждой страницы создавать отдельную папку с изображениями.
5. Если изображение векторное и не огромное, сохранять его в формате `.svg`.
6. Папка `test-dev` предназначена для изображений, которые позже могут заменяться на продакшене.
7. В `source` кладём растровые файлы в `.jpg` / `.png`. При `npm run build` рядом в `dist/images` появляются `.webp` с тем же именем.
8. В разметке для таких картинок используем `<picture>`: WebP для современных браузеров, JPG/PNG как fallback.

### Подключение растровой картинки

```html
@@include('../parts/_picture.html', {
  webp: 'images/books.webp',
  src: 'images/books.png',
  alt: 'Книги',
  width: '320',
  height: '240',
  loading: 'lazy'
})
```

В dev-режиме (`npm start`) WebP не генерируется — картинка откроется по `src`. После сборки в `dist` подхватится и `source`, и WebP.

### Неправильно
```shell
└── source/
    └── test-dev/
        ├── 1.png
        ├── 2.png
        └── 3.png    
    ├── image-1.svg
    ├── image-main-2.png
    └── main-page/
        ├── image-1.svg
        ├── image-main-2.png
        ├── groupIcons.jpg
        ├── groupIcons2.jpg
        └── sm.png
```
### Правильно
```shell
└── source/
    └── test-dev/
        └── product-card/
            ├── 1.png
            ├── 2.png
            └── 3.png
        └── avtor.jpg
    ├── books.png
    ├── logo.svg
    └── planets/
        ├── planets-1.png
        ├── planets-2.png
        └── planets-3.png
    └── stock.png
    └── stock-bg.jpg
```

