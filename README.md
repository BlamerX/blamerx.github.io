# Adarsh Kumar — Portfolio

**Live site:** https://blamerx.github.io

My portfolio as a Data Science & Machine Learning engineer: 10 hand-built projects, Kaggle notebooks, and a competition trail — all in one page, no frameworks, no build step.

[![Live](https://img.shields.io/badge/live%20site-blamerx.github.io-9a4f0d?style=for-the-badge)](https://blamerx.github.io)
[![Kaggle](https://img.shields.io/badge/Kaggle-BlamerX-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/blamerx)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Adarsh%20Kumar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adarshkumar13/)

## What's on the page

- **Hero** — open-to-work status, live-updating counts (Kaggle figures are static by design — their API needs a token no browser should hold)
- **About** — how a project actually goes: gather → clean → model → evaluate → ship
- **Skills** — radar profile; every skill tag is proof-backed with the projects that used it
- **Activity** — Kaggle profile card, GitHub repo feed and contribution heatmap (live from the GitHub API), language split
- **Journey** — degree, internship and the Kaggle Notebook Expert tier
- **Projects** — 10 case studies: GAN portraits, Skin Cancer DenseNet121, AQI Flask+XGBoost on Render, Streamlit stock forecaster, BirdCLEF+ 2026, Playground S6E9 and more — each opens a full deep-dive modal
- **Recognition** — Kaggle Notebook Expert, KPMG SDAIC, Microsoft AI Classroom, Scaler certificates (washi-tape cards, because design matters)

## Under the hood

Plain **HTML + CSS + vanilla JS** (~1,300 lines of script, one stylesheet, zero dependencies, zero build). Progressive enhancement throughout: all content renders with JavaScript disabled; APIs (GitHub only) only ever _enhance_. CSS custom properties for the palette, a prefers-reduced-motion fallback, a print stylesheet, and a hand-drawn identity — sections wear different design "languages" (ledger, notebook doodles, passport stamps, stamp sheet, tab-bar chrome) over one consistent token set.

```bash
# run locally
git clone https://github.com/BlamerX/blamerx.github.io
cd blamerx.github.io
python -m http.server 8000   # or just open index.html
```

## Stats

![repo stars](https://img.shields.io/github/stars/BlamerX/blamerx.github.io?style=social) ·
![pages build](https://img.shields.io/github/deployments/BlamerX/blamerx.github.io/github-pages?label=GitHub%20Pages)

---

_© Adarsh Kumar — built with HTML, CSS & JavaScript._
