(function () {
  "use strict";

  const App = {
    config: { kaggle: "blamerx", github: "BlamerX" },

    defaults: {
      kaggle: {
        rank: 448,
        pool: 61034,
        best: 366,
        code: 18,
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

    initReveal() {
      const els = this.$$(".reveal");
      if (!("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("in"));
        return;
      }
      const obs = new IntersectionObserver(
        (entries, o) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              o.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
      );
      els.forEach((el) => obs.observe(el));

      const kc = this.$(".kaggle-card");
      if (kc) {
        const kObs = new IntersectionObserver(
          (entries, o) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                o.unobserve(e.target);
              }
            });
          },
          { threshold: 0.3 },
        );
        kObs.observe(kc);
      }

      const pCards = this.$$(".project-card");
      if (pCards.length) {
        const pcObs = new IntersectionObserver(
          (entries, o) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                o.unobserve(e.target);
              }
            });
          },
          { threshold: 0.25 },
        );
        pCards.forEach((el) => pcObs.observe(el));
      }
    },

    initCounters() {
      const els = this.$$(".stat-num[data-count]");
      const reduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!els.length) return;
      const run = (el) => {
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
      if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
          (entries, o) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                run(e.target);
                o.unobserve(e.target);
              }
            });
          },
          { threshold: 0.4 },
        );
        els.forEach((el) => obs.observe(el));
      }
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
        deleting = false;
      const TYPE = 75,
        DEL = 40,
        HOLD_FULL = 1700,
        HOLD_EMPTY = 350;
      const tick = () => {
        const word = roles[ri];
        if (deleting) {
          ci--;
          el.textContent = word.substring(0, ci);
          if (ci <= 0) {
            deleting = false;
            ri = (ri + 1) % roles.length;
            setTimeout(tick, HOLD_EMPTY);
            return;
          }
          setTimeout(tick, DEL);
        } else {
          ci++;
          el.textContent = word.substring(0, ci);
          if (ci >= word.length) {
            deleting = true;
            setTimeout(tick, HOLD_FULL);
            return;
          }
          setTimeout(tick, TYPE);
        }
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
      btns.forEach((btn) => {
        btn.addEventListener("click", () => {
          btns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
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
    },

    initEmailCopy() {
      const btn = this.$("#emailBtn");
      const lbl = this.$("#emailLabel");
      if (!btn || !lbl) return;
      btn.addEventListener("click", (e) => {
        const email = btn.getAttribute("data-email");
        if (!navigator.clipboard || !email) return;
        e.preventDefault();
        navigator.clipboard
          .writeText(email)
          .then(() => {
            const orig = email;
            lbl.textContent = "Copied to clipboard ✓";
            setTimeout(() => {
              lbl.textContent = orig;
            }, 1700);
          })
          .catch(() => {
            window.location.href = "mailto:" + email;
          });
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
        const res = await fetch(
          "https://r.jina.ai/https://www.kaggle.com/" + this.config.kaggle,
          {
            headers: { Accept: "text/plain, */*" },
          },
        );
        if (!res.ok) throw new Error("proxy " + res.status);
        const text = await res.text();
        const data = this.parseKaggle(text);
        if (data && Object.keys(data).length) {
          const merged = Object.assign({}, this.defaults.kaggle, data);
          this.applyAll("kaggle", merged, this.kaggleExtras(merged));
          this.updateDonut(merged);
          this.setSyncPill("kaggle", "live", "Live");
        } else {
          this.updateDonut(this.defaults.kaggle);
          this.setSyncPill("kaggle", "cached", "Cached");
        }
      } catch (err) {
        this.updateDonut(this.defaults.kaggle);
        this.setSyncPill("kaggle", "cached", "Cached");
      }
    },

    /* extras return computed values, called with NO args.
       They close over `data` to avoid "[object Object]" bugs. */
    kaggleExtras(data) {
      const self = this;
      return {
        pool() {
          return data.pool ? "of " + self.fmtNumber(data.pool) : "of —";
        },
        percentile() {
          const rank = Number(data.rank),
            pool = Number(data.pool);
          if (!rank || !pool) return "1%";
          const pct = Math.max(1, Math.round((rank / pool) * 100));
          return pct + "%";
        },
        journeySub() {
          const r = data.rank ? self.fmtNumber(data.rank) : "—";
          const p = data.pool ? self.fmtNumber(data.pool) : "—";
          const b = data.best ? self.fmtNumber(data.best) : "—";
          return "Rank " + r + " of " + p + " · Best rank " + b;
        },
        awardsSub() {
          const r = data.rank ? self.fmtNumber(data.rank) : "—";
          const p = data.pool ? self.fmtNumber(data.pool) : "—";
          const rank = Number(data.rank),
            pool = Number(data.pool);
          const pct =
            rank && pool ? Math.max(1, Math.round((rank / pool) * 100)) : 1;
          return "Rank " + r + " of " + p + " · Top " + pct + "% in Notebooks";
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
      out.disc = grab(/Discussion\s*\((\d+)\)/i);
      const rankMatch = text.match(/(\d[\d,]*)\s+of\s+(\d[\d,]*)/);
      if (rankMatch) {
        out.rank = rankMatch[1].replace(/,/g, "");
        out.pool = rankMatch[2].replace(/,/g, "");
      }
      out.silver = grab(/(\d+)\s*[Ss]ilver/i);
      out.bronze = grab(/(\d+)\s*[Bb]ronze/i);
      const best = text.match(/highest ever[\s\S]{0,220}?(\d[\d,]*)/i);
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
      const user = this.config.github;
      let anySuccess = false;
      try {
        const r = await fetch("https://api.github.com/users/" + user, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (r.ok) {
          const data = await r.json();
          this.applyAll("github", {
            repos: data.public_repos,
            followers: data.followers,
            following: data.following,
          });
          anySuccess = true;
        }
      } catch (e) {}
      try {
        const r = await fetch(
          "https://contribkit.app/api/contributions?user=" +
            encodeURIComponent(user),
        );
        if (r.ok) {
          const data = await r.json();
          const cells = (data && data.cells) || [];
          if (cells.length) {
            this.renderHeatmap(cells);
            const total = cells.reduce((sum, d) => sum + (d.count || 0), 0);
            this.applyAll("github", { contribs: total });
            anySuccess = true;
          } else {
            this.renderHeatmap(this.fallbackHeatmap());
          }
        } else {
          this.renderHeatmap(this.fallbackHeatmap());
        }
      } catch (e) {
        this.renderHeatmap(this.fallbackHeatmap());
      }
      this.setSyncPill(
        "github",
        anySuccess ? "live" : "cached",
        anySuccess ? "Live" : "Cached",
      );
    },

    renderHeatmap(cells) {
      const grid = this.$("#heatmapGrid");
      if (!grid) return;
      const levelFor = (c) =>
        !c ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4;
      const frag = document.createDocumentFragment();
      cells.forEach((day) => {
        const cell = document.createElement("span");
        cell.className = "heatmap-cell";
        const lvl =
          typeof day.level === "number" ? day.level : levelFor(day.count || 0);
        cell.setAttribute("data-level", String(lvl));
        cell.title =
          (day.count || 0) +
          " contribution" +
          (day.count === 1 ? "" : "s") +
          " on " +
          day.date;
        frag.appendChild(cell);
      });
      grid.innerHTML = "";
      grid.appendChild(frag);
    },

    fallbackHeatmap() {
      const out = [];
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 364);
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 371; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const seed =
          d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        const rand = Math.sin(seed) * 10000;
        const r = rand - Math.floor(rand);
        let count = 0;
        if (r > 0.55) count = Math.floor(r * 9);
        out.push({
          date: d.toISOString().slice(0, 10),
          count,
          level: !count
            ? 0
            : count <= 2
              ? 1
              : count <= 5
                ? 2
                : count <= 9
                  ? 3
                  : 4,
        });
      }
      return out;
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
      this.initEmailCopy();
      this.fetchKaggle();
      this.fetchGithub();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
  } else {
    App.init();
  }
})();
