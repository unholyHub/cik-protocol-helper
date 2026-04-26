# CIK Protocol Helper

Помощен скрипт за попълване и валидиране на секционни протоколи на ЦИК.

---

## 📦 Инсталация

### 1. Инсталирай Tampermonkey

Ако нямаш инсталиран Tampermonkey, изтегли го за твоя браузър:

| Браузър | Линк                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| Chrome  | [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)     |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)                                 |
| Edge    | [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |

---

### 2. Инсталирай скрипта

Натисни бутона по-долу — Tampermonkey ще отвори диалог за потвърждение автоматично: 

> **[⬇ Инсталирай последният CIK Protocol Helper](https://raw.githubusercontent.com/unholyHub/cik-protocol-helper/main/2026/ns/202604_ns.user.js)**

Натисни **Install** в диалога на Tampermonkey.

---

### 3. Отвори протокол

Влез в секционния протокол на [cik.bg](https://www.cik.bg/protokol/202604_ns) — скриптът се зарежда автоматично.

---

## ✅ Какво прави скриптът

- Показва **жива сума** на гласовете по т. 8 и т. 13
- **Оцветява полетата** в зелено/червено според контролите на ЦИК
- Показва **брояч на преференции** за всяка партия
- Валидира всички 9 контролни условия от протокола в реално време

---

## 📁 Структура (към 04.2026)

```
cik-protocol-helper/
├── 2026/
│   ├── ns/                  # Народно събрание
│   │   └── 202604_ns.js
└── README.md
```

---

## 🗳️ Поддържани избори

| Година | Вид избори       | Приложение                                     | Статус |
| ------ | ---------------- | ---------------------------------------------- | ------ |
| 2026   | Народно събрание | [202604_ns.user.js](2026/ns/202604_ns.user.js) | Готово |

---

## 🤝 Принос

Искаш да добавиш поддръжка за нов вид избори? Отвори **Pull Request** с нова папка по схемата:

```
{година}/{вид}/{годинамесец}_{вид}.user.js
```

---

## 📄 Лиценз

MIT