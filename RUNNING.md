# Run locally

Open index.html directly, or preview the repository root with:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Assets use relative paths and ordinary scripts; no build or package installation is required.

Run verification from the repository root with Node.js:

```sh
node test.js
```

This includes rules, rendering geometry helpers, bar handling, round counting,
and NHP feature/legality tests plus deterministic complete games. No linter or
type checker is configured. Use node --check for edited JavaScript files.
