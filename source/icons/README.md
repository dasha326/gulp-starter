# Папка для иконок, попадающих в `stack.svg`

1. Все названия пишутся латиницей в нижнем регистре и разделяются тире.
2. По имени должно быть понятно, что изображено на иконке.

### Неправильно
```shell
└── source/
    └── icons/
        ├── advantages-1.svg
        ├── close button.svg
        ├── groupIcons.svg
        ├── lg-x-t.svg
        └── Иконка.svg
```
### Правильно
```shell
└── source/
    └── icons/
        ├── menu.svg
        ├── close.svg
        ├── user.svg
        └── credit-card.svg
```

## Подключение иконки в HTML
```html
<svg width="18" height="12">
  <use href="../images/stack.svg#menu"></use>
</svg>
```

## Подключение иконки в стилях
```css
.icon::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  mask-image: url("../images/stack.svg#close");
  mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  background-color: currentcolor;
}
```
