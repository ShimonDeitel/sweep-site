/* =========================================================================
   Sweep — landing interactions (vanilla, no libraries)
   - Theme toggle (persisted)
   - "Freed GB" counter count-up (respects reduced motion + viewport)
   - Footer year
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#F4F7F6" : "#0E1116");
  }

  try {
    var saved = localStorage.getItem("sweep-theme");
    if (saved === "light" || saved === "dark") applyTheme(saved);
  } catch (e) {
    /* localStorage unavailable — keep default dark */
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem("sweep-theme", next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* ---------- Freed GB counter ---------- */
  var numEl = document.getElementById("freedNum");

  function formatGB(v) {
    return v.toFixed(1);
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;

    if (reduceMotion) {
      el.textContent = formatGB(target);
      return;
    }

    var duration = 1600;
    var start = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = formatGB(target * easeOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatGB(target);
      }
    }
    requestAnimationFrame(frame);
  }

  if (numEl) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(numEl);
              obs.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(numEl);
    } else {
      runCounter(numEl);
    }
  }
})();
