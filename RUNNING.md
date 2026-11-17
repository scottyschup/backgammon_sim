# Run locally

From the extracted backgammon-lab directory:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000` in your browser. No build or dependency installation is required.

Run the rules and regression checks with Node.js:

```sh
node test.js
```
