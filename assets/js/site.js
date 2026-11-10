(function () {
  var opener = document.querySelector(".opener");
  var live = document.querySelector(".title-live");
  var ghost = document.querySelector(".title-ghost");
  var hero = document.querySelector(".hero");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!opener || !live || !ghost || !hero || reduce) {
    if (live) {
      live.classList.remove("is-flight");
      var idlePlay = live.querySelector(".title-play");
      if (idlePlay) {
        idlePlay.disabled = true;
      }
    }
    return;
  }

  var ticking = false;
  var playButton = live.querySelector(".title-play");
  var playToken = 0;

  function ease(t) {
    var out = 1 - (1 - t) * (1 - t);
    return t * 0.86 + out * 0.14;
  }

  function place() {
    ticking = false;
    var range = opener.offsetHeight;
    if (!range) {
      return;
    }

    var raw = window.scrollY / range;
    var p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    var reveal = p < 0.72 ? 0 : (p - 0.72) / 0.28;
    if (reveal < 0) {
      reveal = 0;
    }
    if (reveal > 1) {
      reveal = 1;
    }
    hero.style.setProperty("--settle", ease(reveal).toFixed(4));
    document.documentElement.style.setProperty("--haze", ease(p).toFixed(4));

    if (p >= 1) {
      live.classList.remove("is-flight");
      live.style.removeProperty("--title-w");
      if (playButton) {
        playButton.disabled = true;
      }
      return;
    }

    var slot = ghost.getBoundingClientRect();
    var img = live.querySelector("img");
    var aspect = 4047 / 783;
    if (img && img.naturalWidth && img.naturalHeight) {
      aspect = img.naturalWidth / img.naturalHeight;
    }

    var wide = window.innerWidth >= 900;
    var gutter = wide ? 96 : 32;
    var pageW = Math.min(1120, window.innerWidth - gutter);
    var pageLeft = (window.innerWidth - pageW) / 2;
    var endW = slot.width;
    var startW = Math.max(pageW, endW);
    var bottomGap = Math.max(48, window.innerHeight * 0.08);
    var maxH = window.innerHeight - 72 - bottomGap;
    var startH = startW / aspect;
    if (startH > maxH) {
      startH = maxH;
      startW = startH * aspect;
    }

    var moved = ease(p);
    var w = startW + (endW - startW) * moved;
    var startX = pageLeft + (pageW - startW) / 2;
    var x = startX + (slot.left - startX) * moved;
    var startY = window.innerHeight - (startW / aspect) - bottomGap;
    var landedY = slot.top + window.scrollY - range;
    var y = startY + (landedY - startY) * moved;

    live.classList.add("is-flight");
    if (playButton) {
      playButton.disabled = false;
    }
    live.style.setProperty("--title-w", w + "px");
    live.style.setProperty("--title-x", x + "px");
    live.style.setProperty("--title-y", y + "px");
  }

  function request() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(place);
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  var mark = live.querySelector("img");
  if (mark && !mark.complete) {
    mark.addEventListener("load", request);
  }

  function playIntro() {
    var target = opener.offsetHeight;
    if (!target || window.scrollY >= target - 1) {
      return;
    }
    var token = playToken + 1;
    playToken = token;
    var start = window.scrollY;
    var distance = target - start;
    var duration = 980;
    var started = window.performance.now();
    var root = document.documentElement;
    var previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    function landed(t) {
      var cut = 0.22;
      var power = 6;
      var rest = (1 - cut) / (1 + (power - 1) * cut);
      var covered = 1 - rest;
      if (t <= cut) {
        return (covered / cut) * t;
      }
      var u = (t - cut) / (1 - cut);
      return covered + rest * (1 - Math.pow(1 - u, power));
    }

    function step(now) {
      if (token !== playToken) {
        root.style.scrollBehavior = previous;
        return;
      }
      var t = (now - started) / duration;
      if (t >= 1) {
        window.scrollTo({ top: target, behavior: "instant" });
        root.style.scrollBehavior = previous;
        return;
      }
      window.scrollTo({ top: start + distance * landed(t), behavior: "instant" });
      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  function stopPlay() {
    playToken += 1;
  }

  if (playButton) {
    playButton.addEventListener("click", playIntro);
  }
  window.addEventListener("wheel", stopPlay, { passive: true });
  window.addEventListener("touchstart", stopPlay, { passive: true });

  request();
})();

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    return;
  }

  var nodes = document.querySelectorAll(".band, .card, .job, .colophon, .next");
  if (!nodes.length) {
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  nodes.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var seen = rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
    if (seen) {
      return;
    }
    el.classList.add("reveal");
    el.addEventListener("focusin", function () {
      el.classList.add("is-in");
    });
    observer.observe(el);
  });
})();
