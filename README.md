# Paróquia Imaculada Conceição

Institutional website for Paróquia Imaculada Conceição — Uvaranas, Ponta Grossa, Brazil.

Built as a public template. Any parish can fork this repository and adapt it to their own context.

---

## Getting started

```bash
npm install
npm run dev
```

## Documentation

Read [`PROJETO.md`](./PROJETO.md) before anything else. It covers architecture and stack decisions, design tokens and visual identity, frontmatter schema for chapels, events, news and ministries, folder structure, and CI/CD instructions.

> `PROJETO.md` is written in Portuguese, as it is primarily intended for the parish community and local maintainers.

## Adapting for your parish

1. Fork the repository
2. Edit `PROJETO.md` with your parish information
3. Replace the files in `content/capelas/` with your own units
4. Update `locales/pt-BR.json` (or add your own locale) with your UI strings
5. Set up your own environment variables (Supabase, Behold.so)

## Contributing

Improvements that benefit any parish are welcome via Pull Request. Changes specific to a single parish should stay in the fork, not in the template.

## License

MIT