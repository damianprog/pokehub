# Packs 01 · Daily pack open + reveal — wyjaśnienie zmian

## Zmienione pliki

### Dane i logika domenowa

**src/lib/pack-config.ts** (nowy)
Wszystkie liczby, którymi można stroić system paczek, w jednym miejscu:
- `PACK_SIZE = 3`.
- `TIER_WEIGHTS`: szanse na slot z project-overview §4.1. Common 70, Uncommon 20, Rare 9, Ultra rare 1. Typ to `Record<Rarity, number>`, więc TypeScript odrzuci plik, jeśli zabraknie któregoś tieru.
- `SHINY_RATE = 0.005`: szansa 0,5% na shiny w każdym slocie.

Kolejne slice'y dopiszą tu progi pity, wartości dustu i limit zdobytych paczek. Zmiana szans to wtedy edycja jednego pliku, tak jak wymaga overview.

**src/lib/pack-roll.ts** (nowy)
Czysta logika losowania. Nie dotyka bazy, więc da się ją testować osobno.
- `RandomSource`: typ funkcji zwracającej liczbę z [0, 1). Każda funkcja tutaj dostaje ją jako argument zamiast wołać `Math.random` sama. Test albo skrypt może więc podać `() => 0` i wymusić konkretny wynik. Tak wymusiłem trzy shiny tego samego Pokémona.
- `rollTier(random)`: wybiera tier według wag. Mnoży losową liczbę przez sumę wag (100), a potem odejmuje kolejno wagi tierów, aż wartość spadnie poniżej zera. 0–0,70 daje Common, 0,70–0,90 Uncommon, 0,90–0,99 Rare, a 0,99–1 Ultra rare. Jeśli przez zaokrąglenia nic nie pasuje do końca, zwraca ostatni tier. (Szczegółowe wyjaśnienie: patrz sekcja „Jak działa `rollTier`” na końcu pliku.)
- `pickUniform`: równy wybór z tablicy id: `Math.floor(random() * ids.length)`. Źródło losowości zwraca `[0, 1)`, więc indeks zawsze mieści się w zakresie `0 … length - 1`.
- `rollPack(pools, random)`: buduje trzy sloty. Dla każdego losuje tier, potem równo wybiera Pokémona z puli tego tieru, a na końcu robi osobny rzut na shiny. Losowanie najpierw tieru trzyma szanse dokładnie na 70/20/9/1, niezależnie od tego, ile Pokémonów ma każdy tier. Ten sam Pokémon może trafić się dwa razy. Pusty tier rzuca błąd zamiast zwracać `undefined`.

**src/lib/packs.ts** (nowy)
Moduł domenowy, z którego korzysta i server action, i strona. Nigdy nie czyta sesji ani requestu, zgodnie z zasadą warstw z overview §6.1.
- **Typy:**
  - `PackSlot` to wszystko, czego potrzebuje jedna karta: pozycja, id Pokémona, slug, nazwa, URL grafiki (od razu shiny, gdy karta jest shiny), tier, flaga shiny i `isNew`.
  - `OpenedPack` zawiera id paczki, `openedAt` i jej sloty. Czas jest stringiem ISO, więc da się go przekazać z serwera do komponentów klienckich.
- **`DailyPackAlreadyOpenedError`:** nazwany błąd, który akcja zamienia na przyjazny komunikat.
- **`toSlots(rolls, cards, isFirstCatch)`:** łączy wiersze losowań z danymi kart Pokémonów. Śledzi `Set` już widzianych id, więc tylko pierwszy slot z danym Pokémonem może być New. Druga kopia w tej samej paczce liczy się jako duplikat pierwszej. Każdy slot buduje pole po polu, bo wiersze w ścieżce odczytu niosą też zagnieżdżoną relację `pokemon`. Rozkładanie ich spreadem wysyłało cały wiersz z bazy do przeglądarki. To był bug, który naprawiłem podczas testów.
- **`uniquePokemonIds(rolls)`:** zwraca unikalne id Pokémonów z listy losowań. Używają go obie ścieżki, zapisu i odczytu.
- **`openDailyPack(userId, random = Math.random)`:** otwiera paczkę w jednym `prisma.$transaction`. Każdy zapis używa jednego znacznika czasu `now`. Sama funkcja to tylko lista kroków, a każdy krok to osobna funkcja pomocnicza, która dostaje klienta transakcji (`tx`):
  1. **Zarezerwuj dzień: `claimDailyPack`.** `user.updateMany` ustawia `lastDailyAt = now`, ale tylko tam, gdzie jest null albo wcześniej niż dzisiejsza 00:00 UTC. To jest ochrona przed współbieżnością. UPDATE zakłada blokadę na wierszu użytkownika, więc drugie żądanie czeka, aż pierwsze się zatwierdzi, a potem nie znajduje pasującego wiersza. Wynik 0 rzuca `DailyPackAlreadyOpenedError`. Przy `DEV_UNLOCK_ALL` warunek jest pomijany.
  2. **Zbuduj pule i losuj: `loadTierPools`.** Odczytuje id i rzadkość każdego Pokémona i grupuje je w `TierPools`. Potem `openDailyPack` woła `rollPack`.
  3. **Zapisz paczkę: `createDailyPack`.** Tworzy `Pack` (DAILY / DAILY_FREE, `openedAt = now`) razem z trzema wierszami `PackRoll` w tym samym wywołaniu i zwraca id paczki. Każde losowanie zachowuje tier, jaki miało w chwili losowania.
  4. **Zaktualizuj kolekcję: `findCaughtPokemonIds` i `addPullsToCollection`.**
     - `findCaughtPokemonIds` czyta wiersze `UserPokemon` z `isCaught: true` dla wylosowanych id, żeby ustalić, które Pokémony były już złapane. Wiersz może już istnieć z oceny albo wishlisty z `isCaught` równym false, czego pseudokod z overview nie uwzględniał.
     - Następnie dla każdego unikalnego Pokémona `addPullsToCollection` robi `upsert`. Zwiększa `count` o liczbę trafień, zwiększa `shinyCount` o liczbę trafień shiny i ustawia `firstCaughtAt = now` tylko przy pierwszym złapaniu. Pola oceny i recenzji nigdy nie są zapisywane.
  5. **Zwróć wynik.** Odczytuje pola kart i zwraca `toSlots(...)` z poprawnymi flagami New.
- **`getTodaysDailyPack(userId)`:** odczyt, z którego korzysta strona. On też jest podzielony na funkcje pomocnicze:
  1. **`hasOpenedDailyPackSince`** sprawdza `lastDailyAt`, to samo pole, którego używa rezerwacja, więc strona i rezerwacja nie mogą się nie zgadzać. Jeśli to wcześniej niż dziś, zwraca `null`.
  2. **`findDailyPackSince`** pobiera najnowszą dzisiejszą paczkę `DAILY_FREE` z jej losowaniami posortowanymi po pozycji, razem z polami kart.
  3. **`findCaughtInPack`** ustala New. Szuka w bazie wierszy, w których `firstCaughtAt` równa się `openedAt`. To działa, bo `openDailyPack` zapisuje oba pola z tego samego znacznika czasu, więc nie była potrzebna dodatkowa kolumna.

**src/lib/utc-day.ts** (nowy)
Dwie funkcje pomocnicze, które definiują „dzień paczki” jako dzień UTC (overview §4.2):
- `startOfUtcDay(date)` buduje datę przez `Date.UTC(y, m, d)`.
- `nextUtcMidnight(date)` to ta data plus 24 godziny.

Korzystają z nich warunek rezerwacji, dzisiejszy odczyt i cel odliczania.

**src/lib/dev.ts** (nowy)
`DEV_UNLOCK_ALL` jest prawdą tylko wtedy, gdy zmienna środowiskowa ma wartość `"true"` **i** `NODE_ENV` nie jest produkcją, dokładnie jak mówi overview §10.2. Przypadkowa flaga na wdrożeniu nic więc nie robi. W tym slice'ie znosi tylko limit raz na dzień.

**src/lib/pack-styles.ts** (nowy)
Interfejs `PackStyle` (tło, obramowanie, poświata, akcent, tag) i `DAILY_PACK_STYLE`, czyli zielony odcień daily paczki. Źródła zdobytych paczek (recenzja, streak, dust) dostaną własne wpisy w kolejnych slice'ach. `PackWrapper` przyjmuje jeden z tych stylów, więc to samo foliowe opakowanie można pokolorować według źródła.

**src/lib/rarity-colors.ts** (zmieniony)
- `RARITY_CARD_COLORS` dostaje **COMMON** (srebrno-szary) i **UNCOMMON** (niebieski). Są celowo zamienione względem designu.
- Każdy tier dostaje pole `shadow` z pełnym box-shadow. Cień Uncommona zawiera dwa wewnętrzne pierścienie, które rysują podwójną ramkę.
- Nowe `RARITY_LABELS` podaje drukowane nazwy tierów (np. `ULTRA_RARE` → „ULTRA RARE”).
- Istniejące pola `gradient` / `border` / `glow` / `caption` się nie zmieniły, więc `Hero` i `PackTease` na landingu wyglądają dokładnie jak wcześniej.

### Server action

**src/actions/packs.ts** (nowy)
`openDailyPackAction()`, cienki wrapper `"use server"`:
- **Nie przyjmuje żadnych danych wejściowych.** Użytkownik pochodzi wyłącznie z `auth()`, więc nikt nie otworzy paczki za innego użytkownika, a Zod nie ma czego walidować.
- Woła `openDailyPack`, rewaliduje `/packs` i zwraca projektowy kształt `{ success, data, error }`.
- Przy `DailyPackAlreadyOpenedError` zwraca `alreadyOpened: true`, żeby klient mógł potraktować to inaczej niż prawdziwy błąd. Każdy inny błąd jest logowany i zamienia się w „Couldn't open the pack, try again.”

### Trasa

**src/app/(app)/packs/page.tsx** (nowy)
Asynchroniczny komponent serwerowy w grupie tras `(app)`, więc automatycznie dostaje nawigację, tło i kontener.
- Czyta sesję. `proxy.ts` już przekierowuje niezalogowanych, a `redirect("/sign-in")` tutaj tylko zawęża typ.
- Wczytuje `getTodaysDailyPack`. Przy `DEV_UNLOCK_ALL` to pomija i przekazuje `null`, więc paczka zawsze startuje zamknięta.
- Renderuje `PacksHeader` i `PackStage`, przekazując `resetAt` (najbliższą 00:00 UTC) i `serverNow` (czas renderu na serwerze), których odliczania potrzebują do czystej hydratacji.

**src/app/(app)/packs/loading.tsx** (nowy)
Szkielet ładowania trasy: prawdziwy nagłówek (to zwykły tekst, więc nie potrzebuje placeholdera) i karta sceny z dwoma migoczącymi blokami, jednym wielkości paczki, drugim wielkości przycisku. Używa tego samego migotania `animate-skeleton` co Pokédex.

### Hooki

**src/hooks/use-minute-clock.ts** (nowy)
`useMinuteClock(serverNow)` jest zbudowany na `useSyncExternalStore`:
- Subskrybuje interwał co sekundę, ale jego snapshot to bieżący czas zaokrąglony w dół do minuty. React renderuje więc ponownie tylko raz na minutę, a snapshot jest stabilny między sprawdzeniami, czego wymaga `useSyncExternalStore`.
- Podczas renderu na serwerze i hydratacji zwraca `serverNow` zaokrąglone tak samo. Tekst odliczania w HTML z serwera zgadza się więc z pierwszym renderem klienta i nie ma ostrzeżenia o hydratacji.

**src/hooks/use-is-client.ts** (nowy)
`useIsClient()` też jest zbudowany na `useSyncExternalStore`. Jego snapshoty to `false` na serwerze i podczas hydratacji, a `true` później. Służy do treści, które może policzyć tylko przeglądarka, tutaj strefa czasowa oglądającego.

### Komponenty (src/components/packs, jeden na plik)

**PacksHeader.tsx** (nowy)
Tytuł „Packs” i podtytuł z designu. Podtytuł jest ukryty na mobile, jak na artboardzie 375.

**PackStageCard.tsx** (nowy)
Duża zaokrąglona ciemna karta, w której renderuje się każdy stan. Ma minimalną wysokość 440px na desktopie oraz mniejsze odstępy i zaokrąglenia na mobile.

**PackWrapper.tsx** (nowy)
Foliowe opakowanie boostera, komponent zgodny z serwerem, złożony z warstw:
- odcień źródła, obramowanie i poświata (inline `style`, bo pochodzą z `PackStyle` w czasie działania);
- ukośny połysk;
- dwa ząbkowane zgrzewy narysowane powtarzającym się gradientem liniowym;
- znaczek „P” i napis PokeHub;
- okienko z trzema stałymi, dekoracyjnymi grafikami (Gengar i Dragonite przechyleni na zewnątrz, Pikachu z przodu) pod połyskiem;
- tag źródła i „3 CARDS” na dole.

Jest `aria-hidden`, bo to dekoracja. Resztą steruje prop `state`: `"opening"` dodaje kołysanie `packShake` (wyłączone przy ograniczonym ruchu), a `"error"` przyciemnia opakowanie i usuwa poświatę. Rysowane jest w rozmiarze desktopowym 180×252 i skalowane przez `zoom: 0.744` poniżej `md`. To dokładnie odpowiada 134-pikselowemu opakowaniu z designu mobilnego bez drugiego zestawu rozmiarów, a w odróżnieniu od `transform: scale` `zoom` zmniejsza też miejsce, które element zajmuje. Obrazki mają `loading="eager"`, bo opakowanie to największy obraz na stronie, co usunęło ostrzeżenie Next o LCP.

**PackCard.tsx** (nowy)
Jeden wylosowany Pokémon jako karta tieru, linkująca do `/p/[slug]`.
- **Zwykła karta:** gradient radialny z `RARITY_CARD_COLORS[rarity]`, z obramowaniem i cieniem tego tieru, oraz drobna kratka na desktopie.
- **Karta shiny:**
  - złoto-miętowe tło zamiast wyglądu tieru plus poświata `animate-shiny-pulse`;
  - przesuwający się błysk;
  - na desktopie trzy iskierki `twinkle` z przesuniętymi opóźnieniami, a na mobile jedna iskierka plus „✦ SHINY” w rogu.
- **Etykieta:** w stylu „✦ SHINY · RARE” na desktopie, a na mobile sam tier, zgodnie z dwoma artboardami designu.
- **Dostępność i ruch:** każda zapętlona animacja ma `motion-reduce:animate-none`, a tekst alternatywny mówi „Shiny X” dla shiny.

**PackCardRow.tsx** (nowy)
Rząd trzech kart, każda z linią „New! added to collection” / „Duplicate” pod spodem. Przy `animated` każda karta dostaje `animate-pack-card-in` (pojawienie się i uniesienie) z opóźnieniami 350 / 800 / 1250 ms. Te klasy są wypisane dosłownie w tablicy `STAGGER`, żeby Tailwind mógł je znaleźć. Tryb wypełnienia CSS `both` trzyma każdą kartę ukrytą w czasie jej opóźnienia, a całe rozłożenie w czasie to czysty CSS, bez timerów w Reakcie.

**PackCountdown.tsx** (nowy, kliencki)
Pokazuje „Xh Ym” do `resetAt`, korzystając z `useMinuteClock`. Zaokrągla pozostałe minuty w górę, więc „0h 0m” pojawia się dopiero w momencie resetu. Po dojściu do zera `useEffect` woła `router.refresh()`, więc o nowym stanie decyduje serwer, a nie zgadujący klient.

**PackOpenedAt.tsx** (nowy, kliencki)
Godzina „Opened at” z `toLocaleTimeString` w strefie czasowej oglądającego. Nic nie renderuje, dopóki `useIsClient()` nie zmieni się na true, więc serwer nigdy nie wysyła czasu UTC, który potem by mignął albo się nie zgadzał. Tytuł ma `min-h`, żeby układ nie skakał, póki jest pusty.

**PackErrorNotice.tsx** (nowy)
Czerwony komunikat: „Couldn't open the pack, try again.” / „Your pack wasn't used. It's still waiting for you.” Ma `role="alert"`, żeby czytniki ekranu go ogłosiły.

**PackClosedView.tsx** (nowy)
Stan nieotwartej paczki, sterowany propem `phase` (`idle` / `opening` / `error`):
- nadtytuł „FREE TODAY” i tytuł „Daily pack”;
- `PackWrapper` w odpowiednim stanie;
- komunikat o błędzie, gdy faza to `error`;
- przycisk: podczas otwierania wyłączony, z kręcącym się wskaźnikiem w CSS i „Opening…”, a poza tym „Open daily pack” albo „Try again”, które wołają `onOpen`;
- linia pod spodem: „Shuffling your cards” podczas otwierania, a poza tym „One free pack a day · resets at midnight UTC”.

Przycisk ma pełną szerokość na mobile i automatyczną na desktopie.

**PackRevealView.tsx** (nowy, kliencki)
Widok tuż po otwarciu:
- nagłówek „DAILY PACK” / „Here's what you got”;
- animowany `PackCardRow`;
- podsumowanie („N new · M duplicate(s)”, z pominięciem części równej zero);
- „Replay animation” i „Next pack in”.

Replay tylko zwiększa licznik `replays`, używany jako `key` rzędu. React wtedy montuje rząd od nowa, a animacje CSS grają od początku, bez ponownego pobierania danych.

**PackTodayView.tsx** (nowy)
Kolejna wizyta tego samego dnia UTC:
- nagłówek „TODAY'S DAILY PACK” / „Opened at …”;
- statyczny `PackCardRow`;
- panel „Next free pack in” z dużym odliczaniem i „resets at midnight UTC” (ta ostatnia linia tylko na desktopie). Na mobile panel układa się pionowo.

**PackStage.tsx** (nowy, kliencki)
Maszyna stanów, która spina całą scenę.
- **Stan:**
  - `revealed`: paczka otwarta w tej karcie;
  - `failed`;
  - `useTransition` dla `isOpening`.
- **Co renderuje, w kolejności priorytetu:**
  1. `revealed`, co pokazuje odsłonięcie;
  2. w przeciwnym razie serwerowy `todayPack`, co pokazuje widok dzisiejszy;
  3. w przeciwnym razie widok zamknięty, z fazą wyliczoną z `isOpening` i `failed`.

  Trzymanie odsłonięcia w stanie lokalnym sprawia, że przetrwa ono rewalidację `/packs`, która przychodzi razem z odpowiedzią akcji. Bez tego świeży prop z serwera zastąpiłby animację widokiem dzisiejszym.
- **`handleOpen`:** woła akcję przez `runAction`, które zamienia błędy transportu, np. zerwanie sieci, w zwykły wynik `{ success: false }`.
  - Sukces ustawia `revealed`.
  - `alreadyOpened` pokazuje toast i woła `router.refresh()`, żeby pojawiła się paczka otwarta w drugiej karcie.
  - Wszystko inne ustawia `failed`, co pokazuje stan błędu.

### Pliki współdzielone

**src/app/globals.css** (zmieniony)
Trzy tokeny animacji w `@theme inline`: `--animate-pack-shake`, `--animate-pack-card-in` i `--animate-twinkle`. Towarzyszą im `@keyframes` (`packShake`, `packCardIn`, `twinkle`) pod krótkim komentarzem „Packs”. Ten komentarz zmusił też serwer deweloperski do porzucenia zbuforowanej kopii CSS, w której brakowało tych keyframes.

**src/components/landing/Nav.tsx** (zmieniony)
Wylicza `isPacksActive` (ścieżka to `/packs` albo coś pod nią) obok istniejącego `isPokedexActive` i przekazuje je do `SignedInNav`.

**src/components/landing/SignedInNav.tsx** (zmieniony)
Link „Packs” prowadzi teraz do `/packs` zamiast `/` i dostaje tę samą aktywną „pigułkę” co link Pokedex, gdy `isPacksActive` jest prawdą.

### Dokumentacja

**context/current-feature.md**, **context/features/packs/overview.md**, **context/features/packs/packs-01-daily-pack-open-spec.md** (zmienione)
Status to teraz In Progress, a dokumentacja opisuje paczkę jako foliowe opakowanie.

## Jak to wszystko się łączy

1. `/packs/page.tsx` czyta sesję i `getTodaysDailyPack` (packs.ts → Prisma), a potem renderuje `PackStage` z dzisiejszą paczką albo `null` oraz czasem resetu.
2. `PackStage` wybiera widok:
   - brak paczki daje `PackClosedView`, który pokazuje `PackWrapper` i przycisk;
   - paczka z serwera daje `PackTodayView`.
3. Kliknięcie „Open daily pack” woła `openDailyPackAction` (actions/packs.ts) przez `runAction`. Akcja woła `openDailyPack`, które wykonuje jedną transakcję:
   1. rezerwacja `lastDailyAt` w `claimDailyPack` (ochrona przed drugim otwarciem);
   2. `loadTierPools` i losowanie przez `pack-roll.ts` (szanse z `pack-config.ts`);
   3. zapis `Pack` + `PackRoll` w `createDailyPack`;
   4. upsert `UserPokemon` w `addPullsToCollection`.

   Na koniec zwraca `OpenedPack`.
4. `PackStage` zapisuje wynik i renderuje `PackRevealView`. Karty `PackCardRow` → `PackCard` są kolorowane przez `rarity-colors.ts` i animowane przez keyframes z `globals.css`.
5. Odliczania w obu widokach otwartej paczki używają `PackCountdown` (`useMinuteClock` plus `utc-day.ts`) i odświeżają trasę o północy UTC.
6. `Nav` i `SignedInNav` linkują do `/packs` i podświetlają go.

## Jak działa `rollTier`

Najprościej to sobie wyobrazić jako **linijkę długości 100**, podzieloną na odcinki według wag:

| Odcinek | Zakres na linijce | Długość |
|---|---|---|
| COMMON | 0–70 | 70 |
| UNCOMMON | 70–90 | 20 |
| RARE | 90–99 | 9 |
| ULTRA RARE | 99–100 | 1 |

Losujemy **jeden punkt na tej linijce** i sprawdzamy, w który odcinek trafił. Im dłuższy odcinek, tym częściej w niego trafiamy. Stąd Common wypada w 70% przypadków, a Ultra rare w 1%.

**Krok 1: losowy punkt.** `Math.random()` daje liczbę od 0 do 1 (np. `0.83`). Mnożymy ją przez 100 (sumę wag), więc dostajemy punkt na linijce: `83`.

**Krok 2: w który odcinek wpadł?** Zamiast porównywać z granicami (70, 90, 99), kod po kolei „odejmuje” długości odcinków. Dla punktu 83:

| Krok | Działanie | Wynik | Poniżej zera? |
|---|---|---|---|
| Common | 83 − 70 | 13 | nie, idziemy dalej |
| Uncommon | 13 − 20 | −7 | **tak → wynik: UNCOMMON** |

Punkt 83 leży między 70 a 90, czyli w odcinku Uncommon. Zgadza się.

Inne przykłady:
- `0.42` → punkt 42 → 42 − 70 = −28 → od razu **COMMON**
- `0.95` → punkt 95 → 95 − 70 = 25 → 25 − 20 = 5 → 5 − 9 = −4 → **RARE**
- `0.995` → punkt 99,5 → 29,5 → 9,5 → 0,5 → 0,5 − 1 = −0,5 → **ULTRA RARE**

**Zabezpieczenie na końcu** („jeśli nic nie pasuje, zwraca ostatni tier”): liczby z przecinkiem w komputerze bywają minimalnie niedokładne (np. 99,99999 zamiast 100). Gdyby przez taki drobny błąd odejmowanie nigdy nie zeszło poniżej zera, funkcja i tak zwróci Ultra rare, a nie „nic”. W praktyce prawie nigdy się to nie zdarza.

**Po co odejmowanie zamiast wpisanych na sztywno granic 70/90/99?** Bo wagi siedzą w `pack-config.ts`. Gdy zmienisz np. Rare z 9 na 12, granice przesuną się same i nie trzeba niczego przeliczać w kodzie. Symulacja 600 000 losowań dała 70,07 / 19,98 / 8,96 / 0,98%, czyli zgodnie z wagami.
