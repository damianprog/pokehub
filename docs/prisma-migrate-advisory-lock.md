# Vercel build failing on `prisma migrate deploy` (P1002, advisory lock)

## English

### Symptom

The Vercel build (`prisma generate && prisma migrate deploy && next build`) failed at the migration step with:

> Error: P1002 — Timed out trying to acquire a postgres advisory lock (SELECT pg_advisory_lock(72707369)). Timeout: 10000ms.

A plain Redeploy failed the same way.

### What the lock is for

Every build runs `prisma migrate deploy`. Before touching migrations, Prisma calls `pg_advisory_lock(72707369)` on the database. It isn't a lock on any table, just a reservation in Postgres. Whoever takes number 72707369 first runs the migrations, and everyone else waits. This stops two parallel deploys from applying the same migration at the same time.

### Why the lock didn't go away on its own

It's a **session-level** lock. Postgres releases it in only two cases:

- the process calls `pg_advisory_unlock`, which Prisma does when it finishes;
- the database connection closes.

An earlier `migrate deploy` took the lock and never finished. It could have been a build interrupted mid-way, a local run, or a dropped connection. **On the Postgres side its session was still alive**: the client was gone, but the server didn't know that, so the connection was never closed. An orphaned session like that can hang around for a long time, and the lock stays with it.

### Why every build failed

Each new build tried to take the same lock and waited. Prisma waits at most 10 seconds and then gives up with `P1002`. That's why a plain Redeploy didn't help: the stuck session was still holding the lock.

### What fixed it

1. In the Neon SQL Editor for the **production** branch (`ep-tiny-mud-ast0nx9u`, database `neondb`), find the session holding the lock (the row with `granted = true`):

   ```sql
   SELECT l.pid, l.granted, a.application_name, a.state, a.backend_start, a.query
   FROM pg_locks l JOIN pg_stat_activity a USING (pid)
   WHERE l.locktype = 'advisory' AND l.objid = 72707369;
   ```

2. Terminate that session (replace `12345` with its `pid`):

   ```sql
   SELECT pg_terminate_backend(12345);
   ```

   Postgres automatically released all of its locks.

3. Redeploy in Vercel. The build took the lock immediately. All migrations were already applied, so `migrate deploy` changed nothing, released the lock and moved on to `next build`.

The `application_name` and `backend_start` columns show who opened a stuck session and when.

### How to avoid it

- Don't start a manual Redeploy while the build from a push is still running.
- Don't cancel a build during the `prisma migrate deploy` step.
- Don't run `prisma migrate deploy` locally with the production `DIRECT_URL`.
- If `P1002` with "advisory lock" shows up twice in a row, check `pg_locks` in Neon right away instead of retrying the deploy.
- Avoid `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`. It unblocks the build, but the stuck session keeps hanging and protection against parallel migrations is gone.

---

## Polski

### Objaw

Build na Vercel (`prisma generate && prisma migrate deploy && next build`) padał na kroku migracji z błędem:

> Error: P1002 — Timed out trying to acquire a postgres advisory lock (SELECT pg_advisory_lock(72707369)). Timeout: 10000ms.

Zwykły Redeploy kończył się tak samo.

### Po co jest ta blokada

Każdy build uruchamia `prisma migrate deploy`. Zanim Prisma zrobi cokolwiek z migracjami, wywołuje na bazie `pg_advisory_lock(72707369)`. To nie jest blokada żadnej tabeli, tylko zwykła „rezerwacja” w Postgresie. Kto pierwszy weźmie numer 72707369, ten migruje, a reszta czeka. Dzięki temu dwa równoległe deploye nie zaaplikują tej samej migracji dwa razy naraz.

### Dlaczego blokada nie zniknęła sama

To blokada na poziomie **sesji**. Postgres zwalnia ją tylko w dwóch przypadkach:

- proces wywoła `pg_advisory_unlock`, co Prisma robi na koniec;
- połączenie z bazą się zamknie.

Któryś wcześniejszy `migrate deploy` wziął blokadę i nie dotarł do końca. Mógł to być build przerwany w trakcie, lokalne odpalenie albo zerwane połączenie. **Po stronie Postgresa jego sesja nadal żyła**: klient zniknął, ale serwer o tym nie wiedział, więc połączenie nie zostało zamknięte. Taka „osierocona” sesja może wisieć bardzo długo, a razem z nią blokada.

### Dlaczego każdy build padał

Każdy nowy build próbował wziąć tę samą blokadę i czekał. Prisma czeka maksymalnie 10 sekund, a potem się poddaje z błędem `P1002`. Dlatego zwykły Redeploy nic nie dał: zawieszona sesja dalej trzymała blokadę.

### Co naprawiło problem

1. W Neon SQL Editor dla brancha **produkcyjnego** (`ep-tiny-mud-ast0nx9u`, baza `neondb`) znajdź sesję trzymającą blokadę (wiersz z `granted = true`):

   ```sql
   SELECT l.pid, l.granted, a.application_name, a.state, a.backend_start, a.query
   FROM pg_locks l JOIN pg_stat_activity a USING (pid)
   WHERE l.locktype = 'advisory' AND l.objid = 72707369;
   ```

2. Zamknij tę sesję (w miejsce `12345` wstaw jej `pid`):

   ```sql
   SELECT pg_terminate_backend(12345);
   ```

   Postgres automatycznie zwolnił wszystkie jej blokady.

3. Zrób Redeploy w Vercel. Build wziął blokadę od razu. Migracje były już zastosowane, więc `migrate deploy` nic nie zmienił, oddał blokadę i przeszedł do `next build`.

Kolumny `application_name` i `backend_start` pokazują, kto i kiedy otworzył zawieszoną sesję.

### Jak tego unikać

- Nie odpalaj ręcznego Redeploy, gdy build z pusha jeszcze trwa.
- Nie przerywaj buildu w trakcie kroku `prisma migrate deploy`.
- Nie uruchamiaj lokalnie `prisma migrate deploy` z produkcyjnym `DIRECT_URL`.
- Jeśli `P1002` z „advisory lock” pojawi się dwa razy pod rząd, od razu sprawdź `pg_locks` w Neonie zamiast ponawiać deploy.
- Unikaj `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`. Odblokowuje build, ale zawieszona sesja dalej wisi, a ochrona przed równoległymi migracjami znika.
