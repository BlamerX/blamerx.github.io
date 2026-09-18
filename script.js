(function () {
  "use strict";

  const App = {
    /* jinaKey: paste a free API key from jina.ai here to make the Kaggle
       live feed deterministic; without it the proxy render lane is rate-gated */
    config: { kaggle: "blamerx", github: "BlamerX", jinaKey: "" },

    defaults: {
      kaggle: {
        rank: 448,
        pool: 60837,
        best: 366,
        code: 21,
        datasets: 1,
        comps: 14,
        disc: 23,
        silver: 4,
        bronze: 10,
        tierLabel: "Notebook Expert",
      },
    },

    $(sel, ctx) {
      return (ctx || document).querySelector(sel);
    },
    $$(sel, ctx) {
      return Array.from((ctx || document).querySelectorAll(sel));
    },

    flash(el) {
      if (!el) return;
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    },

    setSyncPill(source, state, label) {
      const pill = this.$('[data-sync="' + source + '"]');
      if (!pill) return;
      pill.dataset.state = state;
      const lbl = this.$(".sync-label", pill);
      if (lbl) lbl.textContent = label;
    },

    fmtNumber(v) {
      if (v == null || v === "") return "—";
      const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : v;
      return isNaN(n) ? String(v) : Number(n).toLocaleString();
    },

    reduced() {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    },

    observeOnce(els, cb, opts) {
      if (!("IntersectionObserver" in window)) {
        els.forEach(cb);
        return;
      }
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            cb(e.target);
            o.unobserve(e.target);
          }
        });
      }, opts);
      els.forEach((el) => obs.observe(el));
    },

    initReveal() {
      const self = this;
      this.observeOnce(
        this.$$(".reveal, .journey, .skill-group"),
        (el) => {
          el.classList.add("in");
          if (el.classList.contains("section-head") && !self.reduced()) {
            const t = el.querySelector(".section-title");
            if (t) self.scramble(t);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
      );
    },

    scramble(el) {
      const txt = el.textContent;
      const chars = "01<>-_/[]{}=+*#%";
      let frame = 0;
      const step = () => {
        let out = "";
        for (let i = 0; i < txt.length; i++) {
          out +=
            txt[i] === " " || i < frame / 2
              ? txt[i]
              : chars[(Math.random() * chars.length) | 0];
        }
        el.textContent = out;
        if (frame++ / 2 < txt.length) requestAnimationFrame(step);
        else el.textContent = txt;
      };
      step();
    },

    initTilt() {
      if (this.reduced() || !matchMedia("(pointer:fine)").matches) return;
      this.$$(".project-card").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty("--rx", ((0.5 - py) * 4).toFixed(2) + "deg");
          card.style.setProperty("--ry", ((px - 0.5) * 4).toFixed(2) + "deg");
        });
        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        });
      });
    },

    initHeroGlow() {
      const hero = this.$(".hero");
      if (!hero || this.reduced() || !matchMedia("(pointer:fine)").matches)
        return;
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--hx", e.clientX - r.left + "px");
        hero.style.setProperty("--hy", e.clientY - r.top + "px");
        hero.classList.add("glow-on");
      });
      hero.addEventListener("pointerleave", () =>
        hero.classList.remove("glow-on"),
      );
    },

    initCounters() {
      const reduced = this.reduced();
      const run = (el) => {
        const ac = el.getAttribute("data-autocount");
        if (ac) el.setAttribute("data-count", this.$$(ac).length || el.getAttribute("data-count"));
        const target = parseFloat(el.getAttribute("data-count"));
        const dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const unit = suffix ? '<span class="unit">' + suffix + "</span>" : "";
        if (reduced) {
          el.innerHTML = target.toFixed(dec) + unit;
          return;
        }
        const dur = 1500,
          start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.innerHTML = (target * eased).toFixed(dec) + unit;
          if (t < 1) requestAnimationFrame(tick);
          else el.innerHTML = target.toFixed(dec) + unit;
        };
        requestAnimationFrame(tick);
      };
      this.observeOnce(
        this.$$(".stat-num[data-count]"),
        run,
        { threshold: 0.4 },
      );
    },

    initTyper() {
      const el = this.$("#typer");
      if (!el) return;
      const roles = [
        "Data Science",
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
      ];
      let ri = 0,
        ci = 0,
        del = false;
      const tick = () => {
        const w = roles[ri];
        ci += del ? -1 : 1;
        el.textContent = w.slice(0, ci);
        let d;
        if (!del && ci === w.length) {
          del = true;
          d = 1700;
        } else if (del && ci === 0) {
          del = false;
          ri = (ri + 1) % roles.length;
          d = 350;
        } else d = del ? 40 : 75;
        setTimeout(tick, d);
      };
      setTimeout(tick, 600);
    },

    initScrollUI() {
      const header = this.$("#header");
      const progress = this.$("#progress");
      const backToTop = this.$("#backToTop");
      let ticking = false;
      const onScroll = () => {
        const y = window.scrollY || window.pageYOffset;
        if (header) header.classList.toggle("scrolled", y > 6);
        if (progress) {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.width =
            Math.min(100, Math.max(0, h > 0 ? (y / h) * 100 : 0)) + "%";
        }
        if (backToTop) backToTop.classList.toggle("visible", y > 600);
        const jn = this.$(".journey");
        if (jn) {
          const b = jn.getBoundingClientRect();
          for (const d of jn.querySelectorAll(".mile-dot"))
            d.classList.toggle(
              "past",
              d.getBoundingClientRect().top < window.innerHeight * 0.72,
            );
          jn.style.setProperty(
            "--sp",
            Math.max(
              0,
              Math.min(1, (window.innerHeight * 0.72 - b.top) / b.height),
            ).toFixed(3),
          );
        }
        ticking = false;
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
          }
        },
        { passive: true },
      );
      onScroll();

      if (backToTop) {
        backToTop.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    },

    initNav() {
      const menuBtn = this.$("#menuBtn");
      const nav = this.$("#nav");
      if (!menuBtn || !nav) return;
      const close = () => {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      };
      menuBtn.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      this.$$(".nav-link", nav).forEach((l) =>
        l.addEventListener("click", close),
      );
      document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) close();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });

      const sections = this.$$("main section[id]");
      const links = this.$$(".nav-link");
      if ("IntersectionObserver" in window && sections.length) {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                const id = e.target.id;
                links.forEach((l) =>
                  l.classList.toggle(
                    "active",
                    l.getAttribute("href") === "#" + id,
                  ),
                );
              }
            });
          },
          { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
        );
        sections.forEach((s) => obs.observe(s));
      }
    },

    initFilters() {
      const btns = this.$$(".filter-btn");
      const cards = this.$$(".project-card");
      cards.forEach((c) => {
        const n = c.querySelector(".pc-num"),
          b = c.querySelector(".pc-band");
        if (n && b)
          b.insertAdjacentHTML(
            "beforeend",
            '<span class="pc-water" aria-hidden="true">' +
              n.textContent +
              "</span>",
          );
      });
      btns.forEach((btn) => {
        const f = btn.getAttribute("data-filter");
        btn.setAttribute("aria-current", f === "all" ? "true" : "false");
        const badge = btn.querySelector(".count");
        if (badge)
          badge.textContent =
            f === "all"
              ? cards.length
              : cards.filter((c) =>
                  (c.getAttribute("data-category") || "").split(/\s+/).includes(f),
                ).length;
        btn.addEventListener("click", () => {
          btns.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-current", "false");
          });
          btn.classList.add("active");
          btn.setAttribute("aria-current", "true");
          const f = btn.getAttribute("data-filter");
          cards.forEach((card) => {
            const cats = (card.getAttribute("data-category") || "").split(
              /\s+/,
            );
            card.classList.toggle(
              "hidden",
              !(f === "all" || cats.indexOf(f) !== -1),
            );
          });
        });
      });
      /* arriving at a card from a skill popover / chip while a filter
         hides it would land on nothing — reset to All first */
      document.addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest('a[href^="#p-"]');
        if (!a) return;
        const card = document.querySelector(a.getAttribute("href"));
        if (card && card.classList.contains("hidden"))
          this.$(".filter-btn[data-filter='all']").click();
      });
    },

    /* school-year milestones stay in the DOM but collapsed behind the
       "Earlier" row until the reader asks for them */
    initEarly() {
      const btn = this.$("#earlyToggle");
      const ol = this.$(".journey");
      if (!btn || !ol) return;
      btn.addEventListener("click", () => {
        const open = ol.classList.toggle("show-early");
        btn.setAttribute("aria-expanded", open);
        if (open)
          this.$$(".milestone.is-early", ol).forEach((m) =>
            m.classList.add("in"),
          );
      });
    },

    applyAll(prefix, data, extra) {
      this.$$("[data-" + prefix + "]").forEach((el) => {
        const key = el.getAttribute("data-" + prefix);
        let val;
        if (extra && extra[key] !== undefined) val = extra[key]();
        else val = data[key];
        if (val === undefined || val === null || val === "") return;
        const formatted =
          typeof val === "number" ? this.fmtNumber(val) : String(val);
        if (el.textContent.trim() !== formatted) {
          el.textContent = formatted;
          this.flash(el);
        }
      });
      this.$$("[data-" + prefix + "-bar]").forEach((el) => {
        const key = el.getAttribute("data-" + prefix + "-bar");
        const pct = this.barPercent(prefix, key, data[key]);
        if (pct != null) el.style.setProperty("--w", pct + "%");
      });
    },

    barPercent(source, key, val) {
      if (val == null || isNaN(Number(val))) return null;
      const n = Number(val);
      if (source === "kaggle") {
        const map = { code: 20, datasets: 5, comps: 25, disc: 25 };
        const cap = map[key];
        return cap ? Math.min(100, Math.max(8, (n / cap) * 100)) : null;
      }
      return null;
    },

    async fetchKaggle() {
      this.setSyncPill("kaggle", "loading", "Connecting");
      this.applyAll(
        "kaggle",
        this.defaults.kaggle,
        this.kaggleExtras(this.defaults.kaggle),
      );
      try {
        const hdr = { "x-return-format": "html" };
        if (this.config.jinaKey)
          hdr.Authorization = "Bearer " + this.config.jinaKey;
        /* the keyless render lane sometimes serves the unrendered shell;
           retry once with a cache-buster before giving up to Cached */
        let data = {};
        for (let i = 0; i < 2 && !Object.keys(data).length; i++) {
          const res = await fetch(
            "https://r.jina.ai/https://www.kaggle.com/" +
              this.config.kaggle +
              (i ? "?retry=1" : ""),
            { headers: hdr },
          );
          if (!res.ok) throw new Error("proxy " + res.status);
          /* rendered HTML mode; strip tags so the text regexes keep working */
          data = this.parseKaggle(
            (await res.text()).replace(/<[^>]*>/g, " "),
          );
        }
        if (data && Object.keys(data).length) {
          const merged = Object.assign({}, this.defaults.kaggle, data);
          this.applyAll("kaggle", merged, this.kaggleExtras(merged));
          this.updateDonut(merged);
          this.setSyncPill("kaggle", "live", "Live");
          const pill = this.$('.sync-pill[data-sync="kaggle"]');
          if (pill) {
            pill.classList.remove("ripple");
            void pill.offsetWidth;
            pill.classList.add("ripple");
          }
        } else {
          this.updateDonut(this.defaults.kaggle);
          this.setSyncPill("kaggle", "cached", "Cached");
        }
      } catch (err) {
        this.updateDonut(this.defaults.kaggle);
        this.setSyncPill("kaggle", "cached", "Cached");
      }
    },

    /* all public kernels by votes: same jina render lane as the stats feed —
       top 3 become the chips, the FULL list drives the hero upvotes sum;
       when the lane serves the shell instead of the rendered page the
       curated static chips in the HTML stay put */
    async fetchNotebooks() {
      const key = "nbAll";
      try {
        const hit = JSON.parse(sessionStorage.getItem(key) || "0");
        if (hit && Date.now() - hit.ts < 36e5) return this.renderNotebooks(hit.data);
      } catch (e) {}
      const hdr = { "x-return-format": "html" };
      if (this.config.jinaKey) hdr.Authorization = "Bearer " + this.config.jinaKey;
      const url =
        "https://r.jina.ai/https://www.kaggle.com/" +
        this.config.kaggle +
        "/kernels?sortBy=VoteCount&pageSize=40";
      for (let i = 0; i < 2; i++) {
        try {
          const res = await fetch(url + (i ? "&retry=1" : ""), { headers: hdr });
          if (!res.ok) continue;
          const list = this.parseNotebooks(await res.text());
          if (list.length) {
            this.renderNotebooks(list);
            try {
              sessionStorage.setItem(key, JSON.stringify({ data: list, ts: Date.now() }));
            } catch (e) {}
            return;
          }
        } catch (e) {}
      }
    },

    parseNotebooks(html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const out = [],
        seen = {};
      doc.querySelectorAll("a[href]").forEach((a) => {
        const m = (a.getAttribute("href") || "").match(/\/code\/blamerx\/([a-z0-9-]+)/);
        if (!m || seen[m[1]]) return;
        /* cards render votes as icon-glyph text + count, e.g. "arrow_drop_up162" */
        let el = a;
        while (el && !/arrow_drop_up\s*[\d.,]/i.test(el.textContent || ""))
          el = el.parentElement;
        seen[m[1]] = 1;
        if (!el || !el.parentElement) return;
        const v = el.textContent.match(/arrow_drop_up\s*([\d.,]+)(k?)/i);
        const title = (a.textContent || "")
          .replace(/^\s*code/i, "")
          .split(/\s*(?:Notebook|Kernel)\s*·|Updated/i)[0]
          .replace(/\s+/g, " ")
          .trim();
        if (v && title)
          out.push({
            slug: m[1],
            title: title.slice(0, 40),
            votes: Math.round(Number(v[1].replace(/,/g, "")) * (v[2] ? 1e3 : 1)),
          });
      });
      return out.sort((x, y) => y.votes - x.votes);
    },

    renderNotebooks(list) {
      const box = this.$(".nb-chips");
      if (!box || !list || !list.length) return;
      this._nbAll = list;
      const esc = (s) => s.replace(/[&<>"]/g, (c) => "&#" + c.charCodeAt(0) + ";");
      box.innerHTML =
        '<span class="nb-chips-label">From the notebook</span>' +
        list
          .slice(0, 3)
          .map(
            (n, i) =>
              '<a class="nb-note" target="_blank" rel="noopener" href="https://www.kaggle.com/' +
              this.config.kaggle +
              "/" +
              n.slug +
              '"><span class="nb-note-k">Note ' +
              String(i + 1).padStart(2, "0") +
              "</span><h4>" +
              esc(n.title) +
              "</h4><i class=\"nb-votes\">" +
              n.votes +
              "</i></a>",
          )
          .join("");
    },

    /* extras return computed values, called with NO args.
       They close over `data` to avoid "[object Object]" bugs. */
    kaggleExtras(data) {
      const self = this;
      const fmt = (v) => (v ? self.fmtNumber(v) : "—");
      const pct =
        data.rank && data.pool
          ? Math.max(
              1,
              Math.round((Number(data.rank) / Number(data.pool)) * 100),
            )
          : 1;
      return {
        pool() {
          return data.pool ? "of " + fmt(data.pool) : "of —";
        },
        percentile() {
          return pct + "%";
        },
      };
    },

    parseKaggle(text) {
      const out = {};
      const grab = (re) => {
        const m = text.match(re);
        return m ? m[1].replace(/,/g, "") : null;
      };
      out.comps = grab(/Competitions\s*\((\d+)\)/i);
      out.datasets = grab(/Datasets\s*\((\d+)\)/i);
      out.code = grab(/Code\s*\((\d+)\)/i) || grab(/Notebooks\s*\((\d+)\)/i);
      out.disc = grab(/Discussions?\s*\((\d+)\)/i);
      const rankMatch = text.match(/(\d[\d,]*)\s+of\s+(\d[\d,]*)/);
      if (rankMatch) {
        out.rank = rankMatch[1].replace(/,/g, "");
        out.pool = rankMatch[2].replace(/,/g, "");
      }
      /* stripped profile text reads e.g. "Medals 4 10 Rank 448 of 60,837" */
      const medals = text.match(/Medals\s+(\d+)\s+(\d+)/i);
      if (medals) {
        out.silver = medals[1];
        out.bronze = medals[2];
      } else {
        out.silver = grab(/(\d+)\s*[Ss]ilver/i);
        out.bronze = grab(/(\d+)\s*[Bb]ronze/i);
      }
      const best =
        text.match(/([\d,]+)\s*highest ever/i) ||
        text.match(/highest ever[\s\S]{0,220}?(\d[\d,]*)/i);
      if (best) out.best = best[1].replace(/,/g, "");
      Object.keys(out).forEach((k) => {
        if (out[k] == null) delete out[k];
      });
      return out;
    },

    updateDonut(data) {
      const rank = Number(data.rank),
        pool = Number(data.pool);
      if (!rank || !pool) return;
      const pct = Math.max(0.01, Math.min(1, 1 - rank / pool));
      const circumference = 2 * Math.PI * 36;
      const offset = (circumference * (1 - pct)).toFixed(2);
      const donut = this.$(".kg-donut .fill");
      if (donut) donut.style.strokeDashoffset = offset;
      const card = this.$(".kaggle-card");
      if (card) card.style.setProperty("--fill-offset", offset);
    },

    async fetchGithub() {
      this.setSyncPill("github", "loading", "Connecting");
      let anySuccess = false;
      try {
        const r = await fetch("https://api.github.com/users/" + this.config.github, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (r.ok) {
          const data = await r.json();
          this.applyAll("github", {
            repos: data.public_repos,
            followers: data.followers,
          });
          anySuccess = true;
        }
      } catch (e) {}
      this.renderRepos(this.repoFallback);
      try {
        const list = await this.getRepos();
        const stars = list.reduce((s, x) => s + (x.s || 0), 0);
        this.applyAll("github", { stars });
        const hs = this.$("#heroStars");
        if (hs && String(stars) !== hs.getAttribute("data-count")) {
          hs.setAttribute("data-count", stars);
          hs.textContent = stars;
        }
        const newest = list.reduce(
          (m, x) => (x.p && (!m || x.p > m) ? x.p : m),
          null,
        );
        const shipped = this.$("#lastShipped");
        if (newest && shipped) shipped.textContent = this.relWhen(newest);
        this.renderRepos(
          list.slice().sort((a, b) => (a.p < b.p ? 1 : -1)).slice(0, 6),
        );
        anySuccess = true;
      } catch (e) {}
      this.setSyncPill(
        "github",
        anySuccess ? "live" : "cached",
        anySuccess ? "Live" : "Cached",
      );
    },

    /* ONE search-API call feeds the repo list, star count and the language
       card — promise-memoised so both callers share a single request,
       cached in sessionStorage for 1h */
    getRepos() {
      if (this._reposP) return this._reposP;
      this._reposP = (async () => {
        const key = "ghRepos";
        try {
          const hit = JSON.parse(sessionStorage.getItem(key) || "0");
          if (hit && Date.now() - hit.ts < 36e5) return hit.data;
        } catch (e) {}
        const r = await fetch(
          "https://api.github.com/search/repositories?q=user:" +
            encodeURIComponent(this.config.github) +
            "+fork:false&per_page=100",
          { headers: { Accept: "application/vnd.github+json" } },
        );
        if (!r.ok) throw new Error(r.status);
        const list = ((await r.json()).items || []).map((x) => ({
          n: x.name,
          l: x.language,
          p: x.pushed_at,
          s: x.stargazers_count,
          u: x.html_url,
        }));
        if (!list.length) throw new Error("empty");
        try {
          sessionStorage.setItem(key, JSON.stringify({ data: list, ts: Date.now() }));
        } catch (e) {}
        return list;
      })();
      return this._reposP;
    },

    repoFallback: [
      { n: "AI-Resume-Screener", l: "Python" },
      { n: "Air-Quality-Index-Prediction-Website", l: "Python" },
      { n: "Kaggle-Playground-Predection-Competition", l: "Jupyter Notebook" },
      { n: "Stock-Price-Prediction-WebSite", l: "Python" },
      { n: "Kaggle-Competitions", l: "Jupyter Notebook" },
      { n: "Age-and-Gender-Predictor", l: "Python" },
    ],

    /* repo-list dots reuse the exact language-card tones so every
       language reads the same colour across the page */
    langDot: {
      "Jupyter Notebook": "var(--accent)",
      Python: "var(--kaggle)",
      HTML: "var(--cat-vision)",
      CSS: "var(--cat-nlp)",
      "C++": "var(--accent-2)",
      C: "var(--muted-2)",
    },

    relWhen(p) {
      if (!p) return "recently";
      const days = Math.floor((Date.now() - new Date(p)) / 864e5);
      if (days < 7) return "this week";
      if (days < 31) return days + "d ago";
      const mo = Math.floor(days / 30.4);
      return mo < 12 ? mo + "mo ago" : Math.floor(mo / 12) + "y ago";
    },

    renderRepos(list) {
      const box = this.$("#repoList");
      if (!box) return;
      const esc = (s) => String(s).replace(/[&<>"]/g, (c) => "&#" + c.charCodeAt(0) + ";");
      box.innerHTML = list
        .map(
          (r) =>
            '<a class="repo-item" target="_blank" rel="noopener" href="' +
            (r.u ||
              "https://github.com/" + this.config.github + "?tab=repositories") +
            '"><i style="--c:' +
            (this.langDot[r.l] || "var(--muted-2)") +
            '"></i><b>' +
            esc(r.n) +
            "</b><span>" +
            this.relWhen(r.p) +
            "</span></a>",
        )
        .join("");
    },

    /* which project cards actually used each skill — hovering a tag
       opens a popover whose entries jump straight to that card */
    proofNames: {
      gan: "GAN Portraits",
      skin: "Skin Cancer",
      stock: "Stock LSTM",
      resume: "Resume Screener",
      sign: "Sign Language",
      aqi: "AQI Pipeline",
      playground: "Playground S6",
      birdclef: "BirdCLEF 2026",
      age: "Age & Gender",
      fake: "Fake News",
    },
    skillProof: {
      Python: ["aqi", "playground", "stock"],
      MySQL: ["aqi"],
      TensorFlow: ["gan", "skin", "birdclef"],
      Keras: ["age", "fake", "gan"],
      "Scikit-learn": ["resume", "aqi"],
      OpenCV: ["skin", "sign", "age"],
      Streamlit: ["stock", "resume"],
      Flask: ["aqi"],
      NumPy: ["stock", "aqi"],
      Pandas: ["playground", "birdclef"],
      Plotly: ["stock", "fake"],
      Matplotlib: ["sign", "skin"],
      Seaborn: ["fake", "aqi"],
      BeautifulSoup: ["aqi"],
      Git: ["playground", "aqi"],
      Kaggle: ["playground", "birdclef"],
      Colab: ["sign", "age"],
      Jupyter: ["playground", "skin"],
    },
    initSkillProof() {
      const names = this.proofNames;
      const groups = new Map();
      this.$$(".tag").forEach((t) => {
        const ks = this.skillProof[t.textContent.trim()];
        if (!ks) return;
        t.classList.add("w" + Math.min(3, ks.length));
        const g = t.closest(".skill-group");
        if (g) {
          if (!groups.has(g)) groups.set(g, new Set());
          ks.forEach((k) => groups.get(g).add(k));
        }
        t.classList.add("has-proof");
        t.setAttribute("tabindex", "0");
        const pop = document.createElement("span");
        pop.className = "proof-pop";
        pop.innerHTML =
          "<em>Used in</em>" +
          ks.map((k) => '<a href="#p-' + k + '">' + names[k] + "</a>").join("");
        t.appendChild(pop);
      });
      groups.forEach((set, g) => {
        const h = g.querySelector("h3");
        if (h)
          h.insertAdjacentHTML(
            "beforeend",
            '<span class="sg-count">\u2192 ' + set.size + " projects</span>",
          );
      });
    },

    /* language shares (%) computed from the live repo list — shown
       immediately, then replaced when the GitHub API answers */
    langFallback: [
      ["Jupyter Notebook", 63],
      ["Python", 16],
      ["HTML", 16],
      ["CSS", 5],
    ],

    renderLangs(list) {
      const bar = this.$("#langBar");
      const legend = this.$("#langLegend");
      if (!bar || !legend) return;
      const tones = [
        "var(--accent)",
        "var(--kaggle)",
        "var(--cat-vision)",
        "var(--cat-nlp)",
        "var(--muted-2)",
      ];
      bar.innerHTML = legend.innerHTML = "";
      list.forEach(([name, pct], i) => {
        const c = tones[i % tones.length];
        const seg = document.createElement("i");
        seg.className = "lang-seg";
        seg.style.cssText = "width:" + pct + "%;background:" + c;
        seg.title = name + " " + pct + "%";
        bar.appendChild(seg);
        const it = document.createElement("span");
        it.innerHTML =
          '<i style="--c:' + c + '"></i><b>' + name + "</b> " + pct + "%";
        legend.appendChild(it);
      });
    },

    async fetchLangs() {
      this.setSyncPill("langs", "loading", "Connecting");
      this.renderLangs(this.langFallback);
      try {
        const list = await this.getRepos();
        const counts = {};
        let total = 0;
        for (const repo of list) {
          if (!repo.l) continue;
          counts[repo.l] = (counts[repo.l] || 0) + 1;
          total++;
        }
        if (!total) throw new Error("empty");
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 5);
        const rest = sorted.slice(5).reduce((s, e) => s + e[1], 0);
        const dist = top.map(([n, c]) => [n, Math.round((c / total) * 100)]);
        if (rest) dist.push(["Other", Math.round((rest / total) * 100)]);
        dist[0][1] += 100 - dist.reduce((s, e) => s + e[1], 0);
        this.renderLangs(dist);
        this.setSyncPill("langs", "live", "Live");
      } catch (e) {
        this.renderLangs(this.langFallback);
        this.setSyncPill("langs", "cached", "Cached");
      }
    },

    /* single source of truth for the case-study modals — every project
       card's Deep dive link feeds one of these entries */
    caseData: {
      gan: {
        kicker: "Generative Deep Learning",
        title: "Beyond the Canvas — Painterly GAN Portraits",
        problem:
          "Painting datasets are small and wildly inconsistent compared to photo datasets — a GAN trained naively on 10,000+ WikiArt works collapses into copying one or two styles.",
        flow: [
          "Curate 10k+ WikiArt works",
          "Normalise &amp; augment",
          "Generator vs discriminator",
          "Adversarial tuning",
          "Blind gallery test",
        ],
        approach:
          "The two networks were trained head-to-head: every discriminator upgrade forced the generator to chase real brushwork, and heavy augmentation kept the small dataset from being memorised.",
        outcome:
          "Generated portraits blend into the source gallery around 80% of the time — the Beyond the Canvas notebook documents the duel curves.",
        facts: [
          ["10k+", "WikiArt paintings"],
          ["80%", "judge-blend rate"],
          ["Stack", "Python · TensorFlow · Keras"],
          ["Notebook", "Beyond the Canvas"],
        ],
      },
      skin: {
        kicker: "Medical Computer Vision",
        title: "Skin Cancer Classification — DenseNet121",
        problem:
          "Dermatoscopic images are small, noisy and heavily class-imbalanced — seven lesion types where a generic CNN just memorises the majority classes.",
        flow: [
          "Balance 9k+ images",
          "Heavy augmentation",
          "Transfer-learn DenseNet121",
          "Fine-tune top blocks",
          "Per-class evaluation",
        ],
        approach:
          "An ImageNet-pretrained DenseNet121 was fine-tuned behind a rotation, flip, zoom and colour-shift augmentation pipeline that multiplies rare classes instead of letting them drown.",
        outcome:
          "90%+ accuracy across all seven clinical classes; the notebook is the top-voted work on the Kaggle profile with 160+ votes.",
        facts: [
          ["7", "clinical classes"],
          ["9k+", "dermoscopic images"],
          ["90%+", "validation accuracy"],
          ["Stack", "TensorFlow · Keras · OpenCV"],
        ],
      },
      stock: {
        kicker: "Time Series · Deployed App",
        title: "Stock Price Prediction Website",
        problem:
          "Price-forecasting notebooks stop at the metrics screenshot — nobody can actually use them without opening Python.",
        flow: [
          "Pull yfinance history",
          "Window the sequences",
          "Train LSTM",
          "Validate forward",
          "Streamlit UI + Plotly",
          "Deploy",
        ],
        approach:
          "An LSTM reads rolling windows of daily price data, and the whole pipeline is wrapped in a Streamlit interface — enter any Yahoo Finance ticker and get the next 5-trading-day forecast with its back-test chart.",
        outcome:
          "Permanently live on Streamlit Cloud — anyone can stress-test the model on their own ticker in ten seconds.",
        facts: [
          ["5-day", "forecast horizon"],
          ["Live", "streamlit.app deployment"],
          ["Stack", "Python · LSTM · Streamlit · Plotly"],
          ["Data", "Yahoo Finance (yfinance)"],
        ],
      },
      resume: {
        kicker: "NLP · Hiring Automation",
        title: "AI Resume Screener",
        problem:
          "First-round screening is hundreds of near-identical PDFs read by tired humans — slow, inconsistent and biased by reading order.",
        flow: [
          "Parse uploaded resumes",
          "Extract skills &amp; entities",
          "Vectorise (TF-IDF)",
          "Rank vs job description",
          "Streamlit dashboard",
        ],
        approach:
          "Parsed text is reduced to a comparable feature space; resumes are then ranked by similarity to the job description instead of keyword string matching, so synonyms survive.",
        outcome:
          "A live demo that turns a stack of resumes into a ranked shortlist against any job description.",
        facts: [
          ["Auto", "resume → shortlist ranking"],
          ["Live", "streamlit.app demo"],
          ["Stack", "Python · NLP · Scikit-learn · Streamlit"],
          ["Input", "resumes + JD text"],
        ],
      },
      sign: {
        kicker: "Computer Vision · Classification",
        title: "Sign Language Detection — ASL + ISL",
        problem:
          "Sign datasets reward memorisation: near-duplicate frames leak between train and test, so headline accuracy is often a lie.",
        flow: [
          "EDA on raw sign frames",
          "Split-leak check",
          "Normalise &amp; augment",
          "CNN training",
          "Confusion review",
        ],
        approach:
          "Two routes were modelled — landmark key-points of ASL digits and raw-pixel CNNs over ISL alphabet images — each validated with per-class confusion instead of a single accuracy number.",
        outcome:
          "100% on the ASL digit set with clean splits; the EDA-first notebook collected 140+ votes on Kaggle.",
        facts: [
          ["100%", "ASL digit-set accuracy"],
          ["2", "sign languages covered"],
          ["Stack", "OpenCV · TensorFlow · CNN"],
          ["Notebook", "EDA + 100% Acc"],
        ],
      },
      aqi: {
        kicker: "Data engineering → Product",
        title: "India AQI Prediction System",
        problem:
          "Air quality data across Indian cities is scattered, noisy and published as raw pollutant concentrations — useless to a normal resident deciding whether to go for a run.",
        flow: [
          "Scrape real-time pollutant data",
          "Clean &amp; feature-engineer",
          "Benchmark 10+ models",
          "Flask prediction API",
          "Health-advisory UI",
        ],
        approach:
          "Multiple gradient-boosting candidates — XGBoost, LightGBM, CatBoost and more — were trained on the same CV split and only the best predictor was wired into the deployed API.",
        outcome:
          "One click gives a city's predicted AQI with personalised health guidance; the whole pipeline runs on a live Render deployment.",
        facts: [
          ["10+", "models benchmarked"],
          ["Live", "aqi-vov2.onrender.com"],
          ["Stack", "Python · Flask · XGBoost · LightGBM · CatBoost"],
          ["Extras", "Auto-refresh · Interactive charts"],
        ],
      },
      playground: {
        kicker: "Competitive ML",
        title: "Kaggle Playground Series — Season 6",
        flowTitle: "Method",
        problem:
          "Synthetic tabular challenges (EV buying interest, F1 pit stops, irrigation need) where everything leaks unless your validation mirrors the private leaderboard.",
        flow: [
          "EDA + CV design",
          "LGBM baseline",
          "XGB denoising",
          "CatBoost DART",
          "Pseudo-labels + KD",
          "Ridge meta-ensemble",
        ],
        approach:
          "Every trial was logged — OOF vs LB gap, training time, verdict — so each version could build on a hill-climbed ensemble instead of guesswork.",
        outcome:
          "146 tracked submissions across the season; the final meta-ensemble set a personal-best LB score, beating every single-model attempt.",
        facts: [
          ["146", "logged submissions"],
          ["6", "competition episodes tackled"],
          ["Stack", "LightGBM · XGBoost · CatBoost · TabM · Ridge"],
          ["Edge", "Experiment journaling"],
        ],
      },
      birdclef: {
        kicker: "Audio ML · Kaggle Competition",
        title: "BirdCLEF+ 2026 — Few-shot Species Recognition",
        problem:
          "650+ candidate species, ultra-rare classes and 30-second wetland soundscapes that often contain nothing — full fine-tuning is slow and overfits the rarities.",
        flow: [
          "Decode 30s soundscapes",
          "Perch v2 embeddings",
          "Linear-probe classifier",
          "Per-species thresholds",
          "Six logged iterations",
          "Train + inference pair",
        ],
        approach:
          "Instead of training an audio CNN from scratch, precomputed Perch v2 embeddings turned each species into a cheap linear probe — every experiment logged as a new notebook version so regressions stayed visible.",
        outcome:
          "Personal-best 0.907 on the inference notebook with a reusable train→inference pipeline others can fork.",
        facts: [
          ["650+", "candidate species"],
          ["0.907", "inference PB score"],
          ["6", "logged model versions"],
          ["Stack", "TensorFlow · Perch v2 · ROC-AUC"],
        ],
      },
      age: {
        kicker: "Computer Vision · Regression",
        title: "Age &amp; Gender Prediction from Faces",
        problem:
          "Age is regression, gender is classification — one face pipeline has to serve both targets cleanly.",
        flow: [
          "Parse 20k+ UTKFace crops",
          "Self-labelled filenames",
          "Normalise &amp; balance",
          "Two CNN heads",
          "Ship .h5 models",
        ],
        approach:
          "UTKFace filenames carry their own labels, so dataset assembly was fully automated; two CNNs trained on the shared crop pipeline and exported as portable Keras models.",
        outcome:
          "A reusable pair of .h5 models plus a combined-prediction notebook — drop any face in, get age 0–116 and gender out.",
        facts: [
          ["20k+", "labelled face crops"],
          ["0–116", "age regression range"],
          ["2", "deployed .h5 models"],
          ["Stack", "Keras · OpenCV · CNN"],
        ],
      },
      fake: {
        kicker: "NLP · Classification",
        title: "Fake News Detection",
        problem:
          "40k+ real vs fake articles, where writing style — not facts — separates the classes, and a naive model quietly overfits the source outlets.",
        flow: [
          "Tokenise &amp; clean (NLTK)",
          "Word-cloud EDA",
          "Class-balance check",
          "Neural text classifier",
          "Precision / recall / matrix",
        ],
        approach:
          "EDA first: word clouds surfaced the vocabulary fingerprints of each class before any training, and the model was reported with precision, recall and a confusion matrix instead of a bare accuracy number.",
        outcome:
          "A complete evaluation story — what the classifier mistakes, not just how often it is right — documented end to end in the repo.",
        facts: [
          ["40k+", "labelled articles"],
          ["Full", "P · R · confusion-matrix eval"],
          ["Stack", "TensorFlow · Keras · NLTK"],
          ["Viz", "Plotly word clouds"],
        ],
      },
      "cert-kaggle": {
        kicker: "Kaggle · Notebook Expert",
        title: "Earning Notebook Expert",
        problem:
          "Tiers aren't handed out for posting code — a Notebooks Expert has to keep publishing kernels the community actually upvotes and learns from.",
        flowTitle: "What it took",
        flow: [
          "Pick a fresh dataset",
          "Structure EDA → model",
          "Write for readers not judges",
          "Iterate on public feedback",
          "Repeat, consistently",
        ],
        approach:
          "Every notebook is built as a teachable walkthrough — clear narrative, reproducible cells, visualised results — so vote counts and comments compound rather than spike once.",
        outcome:
          "Notebook Expert tier — the current rank and medal counts are shown live in the Activity card above.",
        facts: [
          ["Tier", "Notebook Expert"],
          ["Division", "Notebooks"],
          ["Earned", "2024"],
          ["Stats", "live in Activity ↑"],
        ],
      },
      "cert-kpmg": {
        kicker: "KPMG · Virtual Internship",
        title: "Data Analytics Consulting",
        problem:
          "A client wants numbers turned into decisions — the hard part isn't the model, it's framing a business question a slide can actually answer.",
        flowTitle: "What I did",
        flow: [
          "Read the client brief",
          "Clean &amp; explore data",
          "Build the analysis",
          "Distil insights",
          "Write recommendations",
        ],
        approach:
          "Treated it like a real consulting deliverable: analysis kept defensible, and every finding mapped back to a decision the client could make on Monday.",
        outcome:
          "A completed consulting-style workflow — full working documented end to end in the shared Drive folder.",
        facts: [
          ["Client", "business question"],
          ["Full", "workflow in Drive"],
          ["Skill", "Analytics → insight"],
          ["Format", "Virtual internship"],
        ],
      },
      "cert-microsoft": {
        kicker: "Microsoft · AI Classroom",
        title: "AI Classroom Series",
        problem:
          "Foundational AI is easy to consume and hard to retain — the value was in mapping concepts to how models actually ship.",
        flowTitle: "What I covered",
        flow: [
          "Core AI concepts",
          "Model lifecycle",
          "Azure ML tooling",
          "Responsible-AI practice",
          "Applied demos",
        ],
        approach:
          "Focused on the parts that change how you build — reproducibility, evaluation, and responsible-AI checks — rather than surface-level hype.",
        outcome:
          "A responsible-AI lens I now apply to every project on this page, from the classifier cards to the deployment pipeline.",
        facts: [
          ["June", "cohort session"],
          ["Azure ML", "tooling exposure"],
          ["Focus", "Responsible AI"],
          ["Format", "Classroom series"],
        ],
      },
      "cert-scaler": {
        kicker: "Scaler · Certificates",
        title: "Other Certificates",
        problem:
          "Breadth has to come from somewhere — the fundamentals-to-advanced gaps were filled with structured courses before projects could composite them.",
        flowTitle: "What they cover",
        flow: [
          "Core DS fundamentals",
          "ML · DL theory",
          "Data analytics",
          "Applied projects",
          "Assessment &amp; certs",
        ],
        approach:
          "Coursework chosen for hands-on assignments, not videos — each certificate maps to a capability later reused in a shipped project.",
        outcome:
          "A certificates trail spanning AI · ML · DL · DA; the full set lives in the linked Drive folder.",
        facts: [
          ["Broad", "AI · ML · DL · DA"],
          ["Full", "set in Drive"],
          ["Path", "basics → advanced"],
          ["Angle", "practical work"],
        ],
      },
    },

    caseOrder() {
      return Object.keys(this.caseData);
    },

    openCase(name) {
      const ov = this.$("#caseOverlay");
      const c = this.caseData[name];
      if (!ov || !c) return;
      const src = this.$("#p-" + name);
      if (src)
        ov.style.setProperty(
          "--cc",
          getComputedStyle(src).getPropertyValue("--cat-color").trim(),
        );
      else ov.style.removeProperty("--cc");
      const flow = c.flow
        .map(
          (f, i) =>
            '<span style="--i:' + i + '"><b>' + (i + 1) + "</b>" + f + "</span>",
        )
        .join("<i>\u2192</i>");
      this.$("#caseBody").innerHTML =
        '<p class="case-kicker">Deep dive \u00b7 ' + c.kicker + "</p>" +
        '<h3 class="case-title" id="caseTitle">' + c.title + "</h3>" +
        '<div class="case-cols"><div class="case-main">' +
        "<h4>The problem</h4><p>" + c.problem + "</p>" +
        "<h4>" +
        (c.flowTitle || "Approach") +
        '</h4><div class="flow">' +
        flow +
        "</div><p>" +
        c.approach +
        "</p><h4>Outcome</h4><p>" +
        c.outcome +
        "</p></div><aside class=\"case-facts\">" +
        c.facts
          .map((f) => '<div class="case-fact"><b>' + f[0] + "</b>" + f[1] + "</div>")
          .join("") +
        "</aside></div>";
      this._caseName = name;
      this.syncCaseNav();
      ov.hidden = false;
      document.body.classList.add("case-open");
      const modal = this.$(".case-modal");
      if (modal) modal.scrollTop = 0;
      this.$("#caseClose").focus();
    },

    syncCaseNav() {
      const order = this.caseOrder();
      const i = order.indexOf(this._caseName);
      const pos = this.$("#casePos");
      if (pos) pos.textContent = i + 1 + " / " + order.length;
    },

    stepCase(dir) {
      const order = this.caseOrder();
      const i = order.indexOf(this._caseName);
      if (i < 0) return;
      this.openCase(order[(i + dir + order.length) % order.length]);
    },

    closeCase() {
      const ov = this.$("#caseOverlay");
      if (!ov || ov.hidden) return;
      ov.hidden = true;
      document.body.classList.remove("case-open");
    },

    initCases() {
      this.$$(".pc-case").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openCase(btn.dataset.case);
        }),
      );
      const ov = this.$("#caseOverlay");
      if (!ov) return;
      this.$("#caseClose").addEventListener("click", () => this.closeCase());
      this.$("#casePrev").addEventListener("click", () => this.stepCase(-1));
      this.$("#caseNext").addEventListener("click", () => this.stepCase(1));
      ov.addEventListener("click", (e) => {
        if (e.target === ov) this.closeCase();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.closeCase();
        if (ov.hidden) return;
        if (e.key === "ArrowLeft") this.stepCase(-1);
        if (e.key === "ArrowRight") this.stepCase(1);
      });
    },

    /* normalize stroke lengths once so band icons can self-draw via CSS */
    initBandDraw() {
      this.$$(".pc-band-icon svg").forEach((s) =>
        s.querySelectorAll("path,circle,rect").forEach((el) =>
          el.setAttribute("pathLength", 100),
        ),
      );
    },

    /* echo each recognition card's issuer icon as a ghost watermark */
    initRecWater() {
      this.$$(".recognition-card").forEach((c) => {
        const svg = c.querySelector(".rec-icon svg");
        if (svg)
          c.insertAdjacentHTML(
            "beforeend",
            '<span class="rec-water" aria-hidden="true">' +
              svg.outerHTML +
              "</span>",
          );
      });
    },

    init() {
      const y = this.$("#year");
      if (y) y.textContent = new Date().getFullYear();
      this.initScrollUI();
      this.initNav();
      this.initReveal();
      this.initCounters();
      this.initTyper();
      this.initFilters();
      this.initEarly();
      this.initSkillProof();
      this.initTilt();
      this.initHeroGlow();
      this.initCases();
      this.initBandDraw();
      this.initRecWater();
      this.fetchKaggle();
      this.fetchNotebooks();
      this.fetchGithub();
      this.fetchLangs();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
  } else {
    App.init();
  }
})();
