Glej CLAUDE.md za projektna pravila (vir resnice, pravila objave, brand).

## Dev strežnik

```
npm run dev
```

Astro 5.x nima načina v ozadju — `astro dev` teče v ospredju, ustaviš ga s `Ctrl+C`.
Podukazov `astro dev stop|status|logs` ni.

Privzeta vrata so 4321. Če so zasedena, Astro sam prevzame naslednja prosta (4322,
4323 …) in naslov izpiše ob zagonu — preberi ga iz izpisa, ne predpostavljaj 4321.
Druga vrata izsiliš z `npm run dev -- --port 4400`.

Produkcijski build: `npm run build`. Predogled zgrajene strani: `npm run preview`.

Celotna Astro dokumentacija: https://docs.astro.build
