(function () {
  "use strict";

  /* month names for contribution-cell tooltips; the donut, rank and tier bars
     are static in the HTML — Kaggle exposes no browser-readable endpoint */
  const MON = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const App = {
    config: { github: "BlamerX" },

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

    sig() {
      return typeof AbortSignal !== "undefined" && AbortSignal.timeout
        ? AbortSignal.timeout(6000)
        : undefined;
    },

    esc(s) {
      return String(s == null ? "" : s).replace(
        /[&<>"]/g,
        (c) => "&#" + c.charCodeAt(0) + ";",
      );
    },

    /* One delegated handler for every [data-tip] on the page. Works for nodes
       built at runtime too, and flips below the element when there is no room
       above it. */
    initTip() {
      const tip = this.$("#tipBox");
      if (!tip || tip._on) return;
      tip._on = 1;
      const show = (el) => {
        tip.textContent = el.getAttribute("data-tip") || "";
        const r = el.getBoundingClientRect();
        tip.classList.add("on");
        const w = tip.offsetWidth,
          h = tip.offsetHeight;
        tip.style.left = Math.round(
          Math.min(Math.max(r.left + r.width / 2 - w / 2, 8), innerWidth - w - 8),
        ) + "px";
        tip.style.top = Math.round(
          r.top - h - 10 >= 4 ? r.top - h - 10 : r.bottom + 10,
        ) + "px";
      };
      const hide = () => tip.classList.remove("on");
      const find = (e) => (e.target.closest ? e.target.closest("[data-tip]") : null);
      document.addEventListener("pointerover", (e) => {
        const t = find(e);
        t ? show(t) : hide();
      });
      document.addEventListener("focusin", (e) => {
        const t = find(e);
        t ? show(t) : hide();
      });
      document.addEventListener("pointerdown", hide);
      document.addEventListener("focusout", hide);
      addEventListener("scroll", hide, { passive: true });
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
          /* live data can replace data-count while this is running, so re-read
             it every frame — otherwise the final frame writes back the stale
             placeholder and the hero settles on the wrong number */
          const goal = parseFloat(el.getAttribute("data-count")) || 0;
          el.innerHTML = (goal * eased).toFixed(dec) + unit;
          if (t < 1) requestAnimationFrame(tick);
          else el.innerHTML = goal.toFixed(dec) + unit;
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
      /* deliberately NOT gated on reduced-motion: letter-by-letter typing is
         a content change, not animation — the old opt-out branch swapped
         whole words every few seconds and read as flashing */
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
          progress.style.setProperty(
            "--p",
            Math.min(1, Math.max(0, h > 0 ? y / h : 0)),
          );
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

    applyAll(prefix, data) {
      this.$$("[data-" + prefix + "]").forEach((el) => {
        const val = data[el.getAttribute("data-" + prefix)];
        if (val === undefined || val === null || val === "") return;
        const formatted =
          typeof val === "number" ? this.fmtNumber(val) : String(val);
        if (el.textContent.trim() !== formatted) {
          el.textContent = formatted;
          this.flash(el);
        }
      });
    },

    /* GitHub's daily tally, via a CORS-enabled mirror of it — the one activity
       feed dense enough to draw. Memoised per tab, and the block stays hidden
       rather than showing an empty frame if the feed is unreachable. */
    async initContrib() {
      const card = this.$("#contribCard"),
        grid = this.$("#contribGrid");
      if (!card || !grid) return;
      let days = null;
      try {
        const hit = JSON.parse(sessionStorage.getItem("contrib") || "0");
        if (hit && hit.ts && Date.now() - hit.ts < 36e5) days = hit.days;
      } catch (e) {}
      if (!days) {
        try {
          const res = await fetch(
            "https://github-contributions-api.jogruber.de/v4/" +
              this.config.github +
              "?y=last",
          { signal: this.sig() });
          if (res.ok) {
            days = (await res.json()).contributions;
            try {
              sessionStorage.setItem(
                "contrib",
                JSON.stringify({ days: days, ts: Date.now() }),
              );
            } catch (e) {}
          }
        } catch (e) {}
      }
      if (!Array.isArray(days) || days.length < 30) return;
      let total = 0,
        active = 0,
        best = 0,
        run = 0,
        cur = 0,
        cells = "";
      for (const d of days) {
        const n = Number(d.count) || 0;
        const day = String(d.date || "").slice(0, 10).replace(/[^\d-]/g, "");
        const dp = day.split("-").map(Number);
        const dt = new Date(dp[0], (dp[1] || 1) - 1, dp[2] || 1);
        const when = isNaN(dt)
          ? day
          : MON[dt.getMonth()].slice(0, 3) + " " + dt.getDate() + " " + dt.getFullYear();
        total += n;
        run = n ? run + 1 : 0;
        if (run > best) best = run;
        if (n) active++;
        /* banded by the real count rather than the feed's 0-4 level, so a busy
           day at 25 reads distinctly from one at 6 */
        const lv = n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 9 ? 3 : n <= 19 ? 4 : 5;
        cells +=
          '<i class="contrib-cell" data-lv="' +
          lv +
          '" data-d="' +
          day +
          '" data-c="' +
          n +
          '" data-tip="' +
          when +
          " · " +
          (n || "none") +
          '"></i>';
      }
      /* current streak: walk back from the newest day; a zero today or
         yesterday has not broken a streak yet, so it is skipped */
      for (let i = days.length - 1; i >= 0; i--) {
        const n = Number(days[i].count) || 0;
        if (n) cur++;
        else if (cur === 0 && i >= days.length - 2) continue;
        else break;
      }
      const set = (k, v) => {
        const el = this.$('[data-ghc="' + k + '"]');
        if (el) el.textContent = v;
      };
      set("total", total);
      set("active", active);
      set("best", best);
      set("cur", cur);
      grid.innerHTML = cells;
      /* reveal first: measurements are zero while the card is display:none */
      card.hidden = false;
      this.fitContrib();
      this.contribMonths(days, grid);
      if (!grid._fitBound) {
        grid._fitBound = 1;
        let raf = 0;
        addEventListener(
          "resize",
          () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => this.fitContrib());
          },
          { passive: true },
        );
      }
    },

    /* 53 weeks at GitHub's 11px cells need ~633px, which is wider than this
       card on a laptop and far wider on a phone, so the cells are sized from
       the space actually available rather than spilling out of the card. */
    fitContrib() {
      const wrap = this.$(".contrib-wrap"),
        scroll = this.$(".contrib-scroll"),
        grid = this.$("#contribGrid");
      if (!wrap || !scroll || !grid || grid.children.length < 14) return;
      const avail = scroll.clientWidth;
      if (!avail) return;
      const weeks = Math.ceil(grid.children.length / 7);
      /* the gap gives way before the cells do, and below 400px it closes
         entirely: 53 weeks at the 3px floor then need 159px, which even a
         320px phone can hand over, so the newest week is never clipped */
      const gap = avail < 400 ? 0 : avail < 560 ? 1 : avail < 800 ? 2 : 3;
      const ideal = (avail - (weeks - 1) * gap) / weeks;
      wrap.style.setProperty("--cs", Math.max(3, Math.min(13, Math.floor(ideal))) + "px");
      wrap.style.setProperty("--cg", gap + "px");
    },

    /* Month labels are placed as a percentage of the row, not in pixels, so
       they stay over the right week when the cells resize. */
    contribMonths(days, grid) {
      const box = this.$("#contribMonths");
      if (!box || grid.children.length < 9) return;
      const weeks = Math.ceil(grid.children.length / 7);
      let out = "",
        last = -1;
      for (let w = 0; w < weeks; w++) {
        const d = days[w * 7];
        const m = Number(String(d && d.date).slice(5, 7)) - 1;
        if (m < 0 || m > 11 || m === last) continue;
        out +=
          '<span style="--x:' +
          ((w / weeks) * 100).toFixed(2) +
          '%">' +
          "JanFebMarAprMayJunJulAugSepOctNovDec".slice(m * 3, m * 3 + 3) +
          "</span>";
        last = m;
      }
      box.innerHTML = out;
    },


    /* ---- contest rating dials -------------------------------------------
       Shared 800-2000 scale: needle angle = 0.2deg per rating point, so the
       three dials stay comparable. The rating is the only input — needle, band
       tint, gate tick, gap chip and aria text all derive from it, so any rating
       change redraws the whole instrument. Codeforces answers cross-origin,
       LeetCode publishes through the leetcard SVG, CodeChef profile HTML comes
       back through the jina relay; a failed fetch leaves the hand-plotted
       values already in the HTML untouched. */
    cpPt(r, R) {
      const a = ((0.2 * r - 370) * Math.PI) / 180;
      return [84 + R * Math.cos(a), 84 + R * Math.sin(a)];
    },

    /* Official floors. CodeChef star bands and Codeforces titles are the
       published ones; LeetCode hands out percentile badges (his profile reads
       "Knight — Top 25% site-wide") rather than rating titles, so that dial
       counts to the next whole hundred instead of inventing a rank name. */
    cpTiers: {
      cc: [
        [1000, "1★"],
        [1200, "2★"],
        [1500, "3★"],
        [1800, "4★"],
        [2100, "5★"],
        [2400, "6★"],
        [3000, "7★"],
      ],
      cf: [
        [1200, "Pupil"],
        [1400, "Specialist"],
        [1600, "Expert"],
        [1900, "Candidate Master"],
        [2200, "Master"],
        [2400, "International Master"],
        [2600, "Grandmaster"],
        [3000, "Legendary Grandmaster"],
      ],
    },

    cpBand(key, rating) {
      if (key === "lc") {
        const hi = (Math.floor(rating / 100) + 1) * 100;
        return { lo: hi - 100, hi: hi, name: "", cur: "" };
      }
      const t = this.cpTiers[key];
      let lo = 800,
        cur = "";
      for (let i = 0; i < t.length; i++) {
        if (t[i][0] <= rating) {
          lo = t[i][0];
          cur = t[i][1];
        } else return { lo: lo, hi: t[i][0], name: t[i][1], cur: cur };
      }
      return { lo: lo, hi: null, name: "", cur: cur };
    },

    plotCp(key, rating) {
      const r = Math.max(800, Math.min(2000, rating));
      const [x, y] = this.cpPt(r, 54);
      /* the hair starts outside the r=27 core circle, never at the hub: the
         printed rating and its CURRENT caption live inside that disc */
      const [x0, y0] = this.cpPt(r, 31);
      const hair = this.$('[data-cp="' + key + '-hair"]');
      if (!hair) return;
      hair.setAttribute("x1", x0.toFixed(1));
      hair.setAttribute("y1", y0.toFixed(1));
      hair.setAttribute("x2", x.toFixed(1));
      hair.setAttribute("y2", y.toFixed(1));
      ["cp-dotring", "cp-dot"].forEach((cls) => {
        const el = this.$('[data-cp="' + key + "-" + cls.split("-")[1] + '"]');
        if (!el) return;
        el.setAttribute("cx", x.toFixed(1));
        el.setAttribute("cy", y.toFixed(1));
      });
      const c = this.$('[data-cp="' + key + '-center"]');
      if (c) c.textContent = rating;
    },

    /* the gate tick marks the floor being chased; nothing to chase inside the
       scale means both tick and number come off the dial */
    cpGate(key, floor) {
      const line = this.$('[data-cp="' + key + '-gateline"]');
      const lbl = this.$('[data-cp="' + key + '-gatellbl"]');
      if (!line || !lbl) return;
      const shown = floor != null && floor <= 2000;
      line.style.display = shown ? "" : "none";
      /* a floor sitting on the scale end is already named by the end label */
      const lblShown = shown && floor < 1950;
      lbl.style.display = lblShown ? "" : "none";
      if (!shown) return;
      const [x1, y1] = this.cpPt(floor, 54);
      const [x2, y2] = this.cpPt(floor, 68);
      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", y1.toFixed(1));
      line.setAttribute("x2", x2.toFixed(1));
      line.setAttribute("y2", y2.toFixed(1));
      if (!lblShown) return;
      const a = ((0.2 * floor - 370) * Math.PI) / 180;
      const lx = Math.min(154, Math.max(14, 84 + Math.cos(a) * 80));
      const ly = Math.min(150, Math.max(9, 84 + Math.sin(a) * 80 + 3));
      lbl.setAttribute("x", lx.toFixed(1));
      lbl.setAttribute("y", ly.toFixed(1));
      lbl.textContent = floor;
    },

    /* the coloured arc is the band the needle currently sits in */
    cpTint(key, b) {
      const p = this.$('[data-cp="' + key + '-tint"]');
      if (!p) return;
      const lo = Math.max(800, b.lo);
      const hi = Math.min(2000, b.hi == null ? 2000 : b.hi);
      if (hi - lo < 20) {
        p.style.display = "none";
        return;
      }
      p.style.display = "";
      const [x1, y1] = this.cpPt(lo, 62);
      const [x2, y2] = this.cpPt(hi, 62);
      p.setAttribute(
        "d",
        "M" +
          x1.toFixed(1) +
          " " +
          y1.toFixed(1) +
          " A62 62 0 " +
          ((hi - lo) * 0.2 > 180 ? 1 : 0) +
          " 1 " +
          x2.toFixed(1) +
          " " +
          y2.toFixed(1),
      );
    },

    cpNames: { cc: "CodeChef", cf: "Codeforces", lc: "LeetCode contest" },

    cpRender(key, rating) {
      if (!rating) return false;
      this.plotCp(key, rating);
      /* the dial face ships with no reading on it, so the needle group only
         becomes visible once a live rating has actually been plotted */
      const g = this.$('[data-cp="' + key + '-svg"] .cp-reading');
      if (g) g.style.display = "";
      const b = this.cpBand(key, rating);
      const gap = this.$('[data-cp="' + key + '-gap"]');
      if (gap)
        gap.innerHTML =
          b.hi == null
            ? "<b>" + b.cur + "</b> · highest band"
            : "+" +
              (b.hi - rating) +
              " to <b>" +
              (b.name || b.hi) +
              "</b>" +
              (b.name ? " @ " + b.hi : "");
      this.cpGate(key, b.hi);
      this.cpTint(key, b);
      const svg = this.$('[data-cp="' + key + '-svg"]');
      if (svg) {
        const target = b.name || (b.hi == null ? "" : "next mark");
        svg.setAttribute(
          "aria-label",
          this.cpNames[key] +
            " rating " +
            rating +
            (b.cur ? ", " + b.cur : "") +
            (b.hi == null
              ? "."
              : "; " +
                target +
                " at " +
                b.hi +
                ", " +
                (b.hi - rating) +
                " points away."),
        );
      }
      return true;
    },

    async fetchCf() {
      const r = await fetch(
        "https://codeforces.com/api/user.info?handles=blamerx_08",
        { signal: this.sig() },
      );
      const j = await r.json();
      if (!r.ok || j.status !== "OK" || !j.result || !j.result[0])
        throw new Error("cf");
      const u = j.result[0];
      this.cpRender("cf", u.rating);
      const val = this.$('[data-cp="cf-val"]');
      const rank = u.rank ? u.rank.charAt(0).toUpperCase() + u.rank.slice(1) : "unranked";
      if (val) val.textContent = u.rating + " · " + rank;
      const sub = this.$('[data-cp="cf-sub"]');
      if (sub) sub.textContent = u.rating === u.maxRating ? "= MAX" : "MAX " + u.maxRating;
      const peak = this.$('[data-cp="cf-peak"]');
      if (peak) peak.textContent = u.maxRating;
      if (u.registrationTimeSeconds) {
        const d = new Date(u.registrationTimeSeconds * 1000);
        const joined = this.$('[data-cp="cf-joined"]');
        if (joined)
          joined.textContent =
            "JanFebMarAprMayJunJulAugSepOctNovDec".slice(d.getMonth() * 3, d.getMonth() * 3 + 3) +
            " " +
            String(d.getFullYear()).slice(2);
      }
      const country = this.$('[data-cp="cf-country"]');
      if (country && u.country) country.textContent = u.country;
      this.fetchCfExtras();
      return true;
    },

    /* two more anonymous-CORS calls, both small: user.rating is the rated-round
       history and user.status is his submission list, from which the solved
       count is the set of distinct problems with an OK verdict */
    async fetchCfExtras() {
      const key = "cfExtras";
      try {
        const hit = JSON.parse(sessionStorage.getItem(key) || "0");
        if (hit && hit.v === 1 && Date.now() - hit.ts < 18e5)
          return this.applyCfExtras(hit.data);
      } catch (e) {}
      try {
        const [rating, status] = await Promise.all([
          fetch("https://codeforces.com/api/user.rating?handle=blamerx_08", {
            signal: this.sig(),
          }).then((r) => r.json()),
          fetch(
            "https://codeforces.com/api/user.status?handle=blamerx_08&from=1&count=10000",
            { signal: this.sig() },
          ).then((r) => r.json()),
        ]);
        if (rating.status !== "OK" || status.status !== "OK") return;
        const rounds = rating.result || [];
        const solved = new Set(
          (status.result || [])
            .filter((s) => s.verdict === "OK" && s.problem)
            .map((s) => s.problem.contestId + s.problem.index),
        );
        const rated = rounds.filter((r) => r.oldRating);
        const data = {
          solved: solved.size,
          rounds: rounds.length,
          jump: rated.length
            ? Math.max(...rated.map((r) => r.newRating - r.oldRating))
            : null,
        };
        try {
          sessionStorage.setItem(
            key,
            JSON.stringify({ v: 1, ts: Date.now(), data: data }),
          );
        } catch (e) {}
        this.applyCfExtras(data);
      } catch (e) {}
    },

    applyCfExtras(d) {
      if (!d) return;
      const put = (k, v) => {
        const el = this.$('[data-cp="' + k + '"]');
        if (el && v != null) el.textContent = v;
      };
      put("cf-solved", d.solved);
      put("cf-rounds", d.rounds);
      put("cf-jump", d.jump == null ? null : (d.jump > 0 ? "+" : "") + d.jump);
      if (d.solved) {
        this._cfSolved = d.solved;
        this.updateCpTotal();
      }
    },

    async fetchLc() {
      const r = await fetch(
        "https://leetcard.jacoblin.cool/BlamerX?theme=light&extension=contest",
        { signal: this.sig() },
      );
      if (!r.ok) throw new Error("lc");
      const doc = new DOMParser().parseFromString(
        await r.text(),
        "image/svg+xml",
      );
      const g = (id) => {
        const el = doc.getElementById(id);
        return el ? el.textContent.trim() : null;
      };
      const rating = Number(g("ext-contest-rating"));
      if (!rating) throw new Error("lc-rating");
      this.cpRender("lc", rating);
      const pct = g("ext-contest-percentage");
      const val = this.$('[data-cp="lc-val"]');
      if (val) val.textContent = rating + (pct ? " · top " + pct : "");
      const solved = parseInt(g("total-solved-text"), 10);
      if (solved) {
        const sc = this.$('[data-cp="lc-solved"]');
        if (sc) sc.textContent = solved;
        this._cpLcSolved = solved;
        this.updateCpTotal();
      }
      /* the card prints "72 / 969" per difficulty, i.e. solved out of the pool,
         so the meter fill is that same real ratio rather than a made-up one */
      ["easy", "medium", "hard"].forEach((d) => {
        const m = (g(d + "-solved-count") || "").match(/(\d+)\s*\/\s*(\d+)/);
        const row = this.$('[data-cp="lc-' + d + '"]');
        if (!m || !row) return;
        const val = row.querySelector("em");
        const fill = row.querySelector(".cp-mini b");
        if (val) val.textContent = m[1] + " / " + m[2];
        if (fill) {
          fill.style.width =
            Math.min(100, (Number(m[1]) / Number(m[2])) * 100).toFixed(1) + "%";
          /* a solved count above zero always leaves a visible sliver, zero
             stays genuinely empty */
          fill.style.minWidth = Number(m[1]) ? "2px" : "0";
        }
      });
      const box = this.$(".cp-solved");
      if (box)
        box.setAttribute(
          "aria-label",
          "LeetCode problems solved out of problems available: " +
            ["easy", "medium", "hard"]
              .map((d) => {
                const raw = g(d + "-solved-count");
                return raw
                  ? d + " " + raw.replace(/\s*\/\s*/, " of ")
                  : null;
              })
              .filter(Boolean)
              .join(", ") +
            ".",
        );
      this.fetchLcExtras();
      return true;
    },

    /* the badge and acceptance rate only exist on the profile page itself,
       which the relay returns as text; purely an upgrade, the dial is already
       drawn from leetcard by the time this lands */
    async fetchLcExtras() {
      const key = "lcProfile";
      const put = (sel, v) => {
        const el = this.$(sel);
        if (el && v) el.textContent = v;
      };
      try {
        const hit = JSON.parse(sessionStorage.getItem(key) || "0");
        if (hit && Date.now() - hit.ts < 18e5) {
          put('[data-cp="lc-badge"]', hit.data.badge);
          put('[data-cp="lc-acc"]', hit.data.acc);
          return;
        }
        const r = await fetch("https://r.jina.ai/https://leetcode.com/BlamerX/", {
          signal:
            typeof AbortSignal !== "undefined" && AbortSignal.timeout
              ? AbortSignal.timeout(15000)
              : undefined,
        });
        if (!r.ok) return;
        const txt = await r.text();
        const badge = (txt.match(/\nLevel\s*\n+([A-Za-z]+)/) || [])[1];
        const accNum = (txt.match(/([\d.]+)%\s*\nAcceptance/) || [])[1];
        const acc = accNum ? accNum + "%" : null;
        if (!badge && !acc) return;
        try {
          sessionStorage.setItem(
            key,
            JSON.stringify({ ts: Date.now(), data: { badge: badge, acc: acc } }),
          );
        } catch (e) {}
        put('[data-cp="lc-badge"]', badge);
        put('[data-cp="lc-acc"]', acc);
      } catch (e) {}
    },

    /* CodeChef has no CORS API, but the jina reader relay fetches the public
       profile server-side and echoes Access-Control-Allow-Origin for GETs
       (X-Return-Format/X-Target-Selector pass preflight). Free tier is ~20
       req/min per IP, so a visitor gets one parsed profile cached for 30min;
       any failure just keeps the values already printed in the HTML. */
    async fetchCc() {
      const key = "ccProfile";
      try {
        const hit = JSON.parse(sessionStorage.getItem(key) || "0");
        if (hit && hit.v === 2 && Date.now() - hit.ts < 18e5) return this.applyCc(hit.data);
      } catch (e) {}
      const r = await fetch("https://r.jina.ai/https://www.codechef.com/users/blamerx", {
        headers: {
          "X-Return-Format": "html",
          "X-Target-Selector": ".user-profile-container",
        },
        signal:
          typeof AbortSignal !== "undefined" && AbortSignal.timeout
            ? AbortSignal.timeout(15000)
            : undefined,
      });
      if (!r.ok) throw new Error("cc");
      const doc = new DOMParser().parseFromString(await r.text(), "text/html");
      const a = doc.querySelector(".rating-container .rating");
      const rating = a ? parseInt(a.textContent, 10) : 0;
      if (!rating) throw new Error("cc-parse");
      const txt = doc.body ? doc.body.textContent : "";
      const mx = txt.match(/Highest Rating (\d+)/);
      const ct = txt.match(/Contests Participated:\s*(\d+)/);
      const sv = txt.match(/Total Problems Solved:\s*(\d+)/);
      /* .global-rank sits in the rating-graph tooltips and names the place he
         took in ONE round; the sidebar list is the standing itself, and the
         badge widgets carry the tiers CodeChef actually awarded */
      const ranks = {};
      doc.querySelectorAll(".widget-rating .rating-ranks li").forEach((li) => {
        const n = li.querySelector("strong");
        if (!n || !/^\d[\d,]*$/.test(n.textContent.trim())) return;
        const v = Number(n.textContent.replace(/,/g, ""));
        const label = li.textContent.toLowerCase();
        if (/global/.test(label) && ranks.global == null) ranks.global = v;
        else if (/country/.test(label) && ranks.country == null) ranks.country = v;
      });
      const badges = [...doc.querySelectorAll(".widget.badges .badge")]
        .map((b) => {
          const title = (b.querySelector(".badge__title") || {}).textContent || "";
          const m = title.match(/^(.+?)\s*-\s*(\w+)\s+Badge/i);
          return m ? { name: m[1].trim(), tier: m[2] } : null;
        })
        .filter(Boolean);
      const data = {
        rating: rating,
        max: mx ? Number(mx[1]) : null,
        contests: ct ? Number(ct[1]) : null,
        solved: sv ? Number(sv[1]) : null,
        global: ranks.global == null ? null : ranks.global,
        country: ranks.country == null ? null : ranks.country,
        badges: badges,
      };
      try {
        sessionStorage.setItem(key, JSON.stringify({ v: 2, ts: Date.now(), data: data }));
      } catch (e) {}
      return this.applyCc(data);
    },

    applyCc(d) {
      if (!d || !d.rating) return false;
      this.cpRender("cc", d.rating);
      const star = this.cpBand("cc", d.rating).cur;
      const val = this.$('[data-cp="cc-val"]');
      if (val)
        val.textContent =
          d.rating + (star ? " · " + star : "") + (d.max ? " · " + d.max + " max" : "");
      const set = (k, v, comma) => {
        const el = this.$('[data-cp="' + k + '"]');
        if (el && v != null) el.textContent = comma ? this.fmtNumber(v) : v;
      };
      set("cc-solved", d.solved);
      set("cc-contests", d.contests);
      set("cc-rank", d.global, true);
      set("cc-country", d.country, true);
      /* the captions are the badges' own names, so a promotion or a different
         badge lands with the right label instead of a stale one */
      ["cc-badge1", "cc-badge2"].forEach((k, i) => {
        const em = this.$('[data-cp="' + k + '"]');
        const b = d.badges && d.badges[i];
        if (!em || !b) return;
        const cap = em.parentElement.querySelector("span");
        if (cap) cap.textContent = b.name.toLowerCase();
        em.textContent = b.tier;
      });
      if (d.solved) {
        this._ccSolved = d.solved;
        this.updateCpTotal();
      }
      return true;
    },

    updateCpTotal() {
      const total = this.$('[data-cp="total"]');
      if (!total) return;
      const parts = [this._ccSolved, this._cfSolved, this._cpLcSolved].filter(
        (v) => v != null,
      );
      /* a "＋" on the figure means at least this much — one of the three
         arenas is still unread, so the sum is a floor rather than a total */
      total.textContent = parts.length
        ? parts.reduce((a, b) => a + b, 0) + (parts.length === 3 ? "" : "+")
        : "—";
    },

    async fetchCp() {
      this.setSyncPill("scope", "loading", "Connecting");
      const [cf, lc, cc] = await Promise.allSettled([
        this.fetchCf(),
        this.fetchLc(),
        this.fetchCc(),
      ]);
      const ok = (x) => x.status === "fulfilled" && x.value;
      const live = [ok(cf), ok(lc), ok(cc)].filter(Boolean).length;
      if (live === 3) this.setSyncPill("scope", "live", "Live");
      else if (live) this.setSyncPill("scope", "cached", live + " of 3 live");
      else this.setSyncPill("scope", "cached", "Unavailable");
    },

    async fetchGithub() {
      this.setSyncPill("github", "loading", "Connecting");
      let anySuccess = false;
      try {
        const r = await fetch("https://api.github.com/users/" + this.config.github, {
          headers: { Accept: "application/vnd.github+json" },
          signal: this.sig(),
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
      try {
        const list = await this.getRepos();
        const stars = list.reduce((s, x) => s + (x.s || 0), 0);
        this.applyAll("github", { stars });
        /* heroStars has no data-github key: setAttribute feeds the live
           count-up, textContent covers the case where it already ran */
        const hs = this.$("#heroStars");
        if (hs) {
          hs.setAttribute("data-count", stars);
          hs.textContent = stars;
        }
        const newest = list.reduce(
          (m, x) => (x.p && (!m || x.p > m) ? x.p : m),
          null,
        );
        const shipped = this.$("#lastShipped");
        if (newest && shipped) shipped.textContent = this.relWhen(newest);
        anySuccess = true;
      } catch (e) {}
      if (await this.fetchSocial()) anySuccess = true;
      this.setSyncPill(
        "github",
        anySuccess ? "live" : "cached",
        anySuccess ? "Live" : "Cached",
      );
    },

    /* open PR / issue counts from the search API — one extra request per
       kind, cached with the repo list so a reload never re-spends quota */
    async fetchSocial() {
      let key = "ghSocial";
      try {
        const hit = JSON.parse(sessionStorage.getItem(key) || "0");
        if (hit && Date.now() - hit.ts < 36e5) {
          this.applyAll("github", hit.data);
          return true;
        }
      } catch (e) {}
      const q = (kind) =>
        fetch(
          "https://api.github.com/search/issues?q=author:" +
            encodeURIComponent(this.config.github) +
            "+" + kind + "&per_page=1",
          { headers: { Accept: "application/vnd.github+json" }, signal: this.sig() },
        )
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((j) => j.total_count);
      try {
        const [prs, issues] = await Promise.all([q("type:pr"), q("type:issue")]);
        this.applyAll("github", { prs: prs, issues: issues });
        try {
          sessionStorage.setItem(
            key,
            JSON.stringify({ data: { prs: prs, issues: issues }, ts: Date.now() }),
          );
        } catch (e) {}
        return true;
      } catch (e) {}
      return false;
    },

    /* Recent public actions. PushEvent payloads ship no commit list and
       PullRequestEvent only a stub (url/id/number/head/base — no title, no
       merged_at), so the tiles count pushes and PRs OPENED, never commits or
       merges, and the strip names the exact event set the numbers cover. */
    async fetchAct() {
      this.setSyncPill("act", "loading", "Connecting");
      const key = "ghEvents";
      try {
        const hit = JSON.parse(sessionStorage.getItem(key) || "0");
        if (hit && hit.data && hit.data.length && Date.now() - hit.ts < 9e5) {
          this.applyAct(hit.data);
          return;
        }
      } catch (e) {}
      try {
        const r = await fetch(
          "https://api.github.com/users/" +
            encodeURIComponent(this.config.github) +
            "/events/public?per_page=100",
          {
            headers: { Accept: "application/vnd.github+json" },
            signal: this.sig(),
          },
        );
        if (!r.ok) throw new Error(r.status);
        const raw = await r.json();
        if (!Array.isArray(raw) || !raw.length) throw new Error("empty");
        const list = raw.map((e) => {
          const p = e.payload || {};
          return {
            t: e.type,
            a: p.action || "",
            r: (e.repo && e.repo.name) || "",
            n: p.number ?? (p.pull_request && p.pull_request.number) ?? null,
            f: p.ref_type === "branch" || p.ref_type === "tag" ? p.ref : "",
            k: p.ref_type || "",
            w: e.created_at,
          };
        });
        /* the events feed is not reliably newest-first — a repo made public in
           September can land between two October pushes */
        list.sort((a, b) => Date.parse(b.w) - Date.parse(a.w));
        try {
          sessionStorage.setItem(key, JSON.stringify({ data: list, ts: Date.now() }));
        } catch (e) {}
        this.applyAct(list);
      } catch (e) {
        this.setSyncPill("act", "cached", "Unavailable");
        this.applyAct(null);
      }
    },

    applyAct(list) {
      const feed = this.$("#actFeed");
      if (!feed) return;
      const put = (sel, val) => {
        const el = this.$(sel);
        if (el) el.textContent = val;
      };
      const dead =
        '<div class="act-empty">No event feed just now — the <a href="https://github.com/BlamerX?tab=activity" target="_blank" rel="noopener">activity tab</a> still lists it.</div>';
      if (!list || !list.length) {
        put('[data-act="window"]', "Feed unavailable");
        const kicker = this.$(".act-kicker");
        if (kicker) kicker.remove();
        const bars = this.$("#actTop");
        if (bars) bars.remove();
        feed.innerHTML = dead;
        return;
      }
      /* stars and forks are not work on a repo, so they count nowhere in
         this card — not in the tiles and not in the feed */
      const work = list.filter((e) => e.t !== "WatchEvent" && e.t !== "ForkEvent");
      let pushes = 0;
      let opened = 0;
      const repos = new Set();
      for (const e of work) {
        if (!e.r) continue;
        repos.add(e.r);
        if (e.t === "PushEvent") pushes++;
        if (e.t === "PullRequestEvent" && /^open/i.test(e.a)) opened++;
      }
      put('[data-act="pushes"]', this.fmtNumber(pushes));
      put('[data-act="opened"]', this.fmtNumber(opened));
      put('[data-act="repos"]', this.fmtNumber(repos.size));

      const pushBy = new Map();
      for (const e of work) {
        if (e.t === "PushEvent" && e.r) pushBy.set(e.r, (pushBy.get(e.r) || 0) + 1);
      }
      const top = Array.from(pushBy.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      const box = this.$("#actTop");
      if (box) {
        const max = top.length ? top[0][1] : 1;
        box.innerHTML = top
          .map(
            (t) =>
              '<a class="act-toprow" href="https://github.com/' +
              this.esc(t[0]) +
              '" target="_blank" rel="noopener">' +
              '<span class="act-name">' + this.esc(this.actName(t[0])) + "</span>" +
              '<i class="act-bar"><b style="width:' + ((t[1] / max) * 100).toFixed(1) + '%"></b></i>' +
              '<span class="act-n">' + t[1] + "</span></a>",
          )
          .join("") || '<div class="act-empty">No pushes in this window.</div>';
        if (top.length) {
          box.setAttribute(
            "aria-label",
            "Pushes by repository, busiest first: " +
              top.map((t) => this.actName(t[0]) + " " + t[1]).join(", ") + ".",
          );
        }
      }

      const days = Math.max(
        1,
        Math.round((Date.now() - new Date(list[list.length - 1].w)) / 864e5),
      );
      /* a full page proves only the page, not the period around it */
      put(
        '[data-act="window"]',
        list.length >= 100
          ? "Latest " + list.length + " public events"
          : "Past " + days + " day" + (days === 1 ? "" : "s"),
      );

      const rows = [];
      const seen = new Set();
      for (const e of work) {
        const html = this.actRow(e);
        if (!html) continue;
        /* repeat pushes to one repo earn a single line of news, and a PR that
           was opened then merged the same week is one row, not two */
        const id = e.n ? e.t + "#" + e.n : e.t + "|" + e.r + "|" + e.f;
        if (seen.has(id)) continue;
        seen.add(id);
        rows.push(html);
        if (rows.length === 4) break;
      }
      feed.innerHTML = rows.join("") || dead;
      this.setSyncPill("act", "live", "Live");
    },

    actName(repo) {
      const parts = repo.split("/");
      return (parts[0] || "").toLowerCase() === this.config.github.toLowerCase()
        ? parts[1] || repo
        : repo;
    },

    actRow(e) {
      if (!e.r) return "";
      const shown = this.actName(e.r);
      let verb = "";
      let href = "https://github.com/" + e.r;
      if (e.t === "PushEvent") verb = "pushed to";
      else if (e.t === "CreateEvent" && e.f)
        verb = "created " + this.actRef(e);
      else if (e.t === "DeleteEvent" && e.f)
        verb = "deleted " + this.actRef(e);
      else if (e.t === "PublicEvent") verb = "made public";
      else if (e.t === "PullRequestEvent" && e.n) {
        if (/merge/i.test(e.a)) verb = "merged PR #" + e.n;
        else if (/close/i.test(e.a)) verb = "closed PR #" + e.n;
        else if (/reopen/i.test(e.a)) verb = "reopened PR #" + e.n;
        else if (/open/i.test(e.a)) verb = "opened PR #" + e.n;
        href += "/pull/" + e.n;
      } else if (e.t === "IssuesEvent" && e.n) {
        const ia = /close/i.test(e.a)
          ? "closed"
          : /reopen/i.test(e.a)
            ? "reopened"
            : /open/i.test(e.a)
              ? "opened"
              : "";
        if (!ia) return "";
        verb = ia + " issue #" + e.n;
        href += "/issues/" + e.n;
      } else return "";
      if (!verb) return "";
      const m = Math.floor((Date.now() - new Date(e.w)) / 6e4);
      const when =
        m < 60
          ? m + "m ago"
          : m < 1440
            ? Math.floor(m / 60) + "h ago"
            : m < 10080
              ? Math.floor(m / 1440) + "d ago"
              : this.relWhen(e.w);
      return (
        '<a class="act-row" href="' + href + '" target="_blank" rel="noopener">' +
        '<span class="act-verb">' + this.esc(verb) + "</span>" +
        '<span class="act-repo">' + this.esc(shown) + "</span>" +
        '<span class="act-when">' + this.esc(when) + "</span></a>"
      );
    },

    actRef(e) {
      const name = e.f.length > 20 ? e.f.slice(0, 20) + "…" : e.f;
      return (e.k === "tag" ? "tag " : "branch ") + name;
    },

    /* ONE search-API call feeds the star count and the language panel —
       promise-memoised so both callers share a single request,
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
          { headers: { Accept: "application/vnd.github+json" }, signal: this.sig() },
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

    relWhen(p) {
      if (!p) return "recently";
      const days = Math.floor((Date.now() - new Date(p)) / 864e5);
      if (days < 7) return "this week";
      if (days < 31) return days + "d ago";
      const mo = Math.floor(days / 30.4);
      return mo < 12 ? mo + "mo ago" : Math.floor(mo / 12) + "y ago";
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
        bar.appendChild(seg);
        const it = document.createElement("span");
        it.innerHTML =
          '<i style="--c:' + c + '"></i><b>' + name + "</b> " + pct + "%";
        legend.appendChild(it);
      });
    },

    /* the card's one Live pill covers the language panel too — both read the
       same repo list, so a second status light would only repeat itself */
    async fetchLangs() {
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
      } catch (e) {
        this.renderLangs(this.langFallback);
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
      "cert-tcsion": {
        kicker: "TCS iON · Career Edge",
        title: "Generative AI Essentials",
        problem:
          "GenAI tooling moves faster than most curricula — the goal was to finish a structured programme on how these models actually work and where they are usable at work, not just hype.",
        flowTitle: "What it covered",
        flow: [
          "Foundations of generative models",
          "Prompt design and iteration",
          "LLM capabilities and limits",
          "Responsible and safe usage",
          "Applied workplace workflows",
        ],
        approach:
          "Completed the full two-week programme (12–26 Sep 2026), pairing each concept with a hands-on use case from day-to-day data work.",
        outcome:
          "Certificate of completion — the signed certificate is linked under the card.",
        facts: [
          ["Issuer", "TCS iON"],
          ["Programme", "Career Edge"],
          ["Dates", "12 – 26 Sep 2026"],
          ["Topic", "Generative AI"],
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
          ["Span", "multiple years"],
          ["Full", "set in Drive"],
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
      /* remembered so closing can hand focus back to the trigger */
      this._caseTrigger = document.activeElement;
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
      const back = this._caseTrigger;
      if (back && back.isConnected && back.focus) back.focus();
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
        /* keep Tab inside the dialog so a keyboard user cannot wander into the
           page behind it */
        if (e.key === "Tab") {
          const items = this.$$(
            "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
            ov,
          ).filter((el) => el.offsetParent !== null);
          if (!items.length) return;
          const first = items[0],
            last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    },

    /* preview the CV in-page instead of shipping the visitor to Drive */
    RESUME_BASE: "https://drive.google.com/file/d/1sLPLNhHqkDzfMtl0Afeg8qD6gMEyFpLW/preview",

    openResume() {
      const ov = this.$("#resumeOverlay");
      if (!ov) return;
      const fr = this.$("#resumeFrame"),
        stage = this.$(".resume-stage");
      /* Drive answers with the current file, never the visitor's cached copy */
      if (fr && stage) {
        stage.classList.remove("resume-ready");
        fr.src = this.RESUME_BASE + "?r=" + Date.now();
      }
      this._resumeTrigger = this.$("#resumeBtn");
      ov.hidden = false;
      document.body.classList.add("resume-open");
      const close = this.$("#resumeClose");
      if (close) close.focus();
    },

    closeResume() {
      const ov = this.$("#resumeOverlay");
      if (!ov || ov.hidden) return;
      ov.hidden = true;
      document.body.classList.remove("resume-open");
      const back = this._resumeTrigger;
      if (back && back.isConnected && back.focus) back.focus();
    },

    initResume() {
      const btn = this.$("#resumeBtn"),
        ov = this.$("#resumeOverlay");
      if (!btn || !ov) return;
      const fr = this.$("#resumeFrame");
      if (fr)
        fr.addEventListener("load", () => {
          if (fr.getAttribute("src") === "about:blank") return;
          const stage = this.$(".resume-stage");
          if (stage) stage.classList.add("resume-ready");
        });
      btn.addEventListener("click", () => this.openResume());
      this.$("#resumeClose").addEventListener("click", () => this.closeResume());
      ov.addEventListener("click", (e) => {
        if (e.target === ov) this.closeResume();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !ov.hidden) this.closeResume();
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
      this.initResume();
      this.initBandDraw();
      this.initRecWater();
      this.initTip();
      this.initContrib();
      this.fetchGithub();
      this.fetchLangs();
      this.fetchAct();
      this.fetchCp();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
  } else {
    App.init();
  }
})();
