# Dostępny modal formularza dokumentu

Zbudowałem małą aplikację w React i TypeScript. Jej głównym elementem jest dostępny modal z formularzem dodawania dokumentu, walidacją oraz kontrolowanym scenariuszem błędu i ponowienia wysyłki.

## Uruchomienie

Wymagany jest Node.js 20.19+ lub 22.12+.

```bash
npm install
npm run dev
```

Sprawdzenie projektu:

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Przed pierwszym testem E2E instaluję Chromium dla Playwright:

```bash
npx playwright install chromium
```

## Założenia

- Założyłem wsparcie współczesnych przeglądarek obsługujących natywny element `<dialog>`.
- Stan formularza i wysyłki pozostawiłem lokalnie. Przy tej skali globalny store ani biblioteka formularzy nie dałyby realnej korzyści.
- Pierwsza próba wysyłki zwraca błąd z dostarczonego fixture'a, a ponowienie kończy się sukcesem. Zamknięcie modala rozpoczyna nowy scenariusz.
- Nie dodałem `maxLength` do notatki. Dzięki temu regułę przekroczenia 200 znaków można osiągnąć i sprawdzić w walidacji.

## Decyzje techniczne

Wybrałem natywny `<dialog>` otwierany przez `showModal()`. Przeglądarka zapewnia top layer, blokadę interakcji z tłem i obsługę Escape. Dodałem małą obsługę Tab i Shift+Tab na krańcach, ponieważ test w Chromium wykazał możliwość przejściowego przeniesienia fokusu poza dialog.

Walidację umieściłem w czystej funkcji `validateDocumentForm`. Błędy pól są niezależne od błędu backendu, a adapter `submitDocument` czyta dostarczone fixture'y bez dodatkowej warstwy API.

## Dostępność

- Po otwarciu fokus trafia na wybór typu dokumentu, a po zamknięciu wraca na przycisk otwierający.
- Nazwa i opis modala są połączone przez `aria-labelledby` i `aria-describedby`.
- Każde pole ma widoczną etykietę. Błędy są połączone z polami i ogłaszane czytnikom ekranu.
- Stan wysyłki, błąd serwera i sukces korzystają z właściwych live regionów.
- Przycisk wysyłki pozostaje dostępny dla fokusu podczas operacji, ale nie pozwala wysłać formularza drugi raz.
- Focus ring i obramowania kontrolek spełniają wymagany kontrast 3:1, a animacja respektuje `prefers-reduced-motion`.

## Walidacja

Numer dokumentu i e-mail są wymagane, e-mail musi mieć poprawny format, a zgoda musi być zaznaczona. Notatka staje się wymagana dla typu `Other` i nie może przekroczyć 200 znaków. Po błędnym submit fokus trafia do pierwszego niepoprawnego pola.

## Organizacja kodu

- Rozdzieliłem odpowiedzialności modala, formularza, walidacji i adaptera danych.
- Wartości formularza mają jedno źródło prawdy. Wymagalność notatki wynika bezpośrednio z wybranego typu dokumentu.
- Stany wysyłki, błędu serwera i sukcesu są jawne, dzięki czemu nie mieszają się z błędami pól.

## Co zrobiłbym dalej przy dodatkowych 60–90 minutach

- dodałbym automatyczny audyt axe oraz testy przy powiększeniu 200–400%,
- sprawdziłbym całość ręcznie z NVDA i VoiceOver,
- uzgodniłbym kontrakt prawdziwego API oraz obsługę anulowania i timeoutu,
- rozszerzyłbym E2E o dynamiczne pole `Other` i przenoszenie fokusu na pierwszy błąd.
