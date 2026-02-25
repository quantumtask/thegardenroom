(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealItems = document.querySelectorAll(".reveal");

      if (reduceMotion) {
        revealItems.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      document.body.classList.add("motion-ready");

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

      revealItems.forEach((el) => observer.observe(el));
    })();

(() => {
      const cards = Array.from(document.querySelectorAll(".work-item-featured"));
      const lightbox = document.getElementById("project-lightbox");
      if (!cards.length || !lightbox) return;

      const lightboxImage = lightbox.querySelector(".lightbox-image");
      const lightboxCaption = lightbox.querySelector(".lightbox-caption");
      const closeBtn = lightbox.querySelector(".lightbox-close");
      const prevBtn = lightbox.querySelector(".lightbox-prev");
      const nextBtn = lightbox.querySelector(".lightbox-next");

      let gallery = [];
      let currentIndex = 0;
      let lastFocused = null;

      const uniqueImages = (card) => {
        const primary = card.querySelector(":scope > img");
        const thumbs = Array.from(card.querySelectorAll(".work-thumb-row img"));
        const nodes = [primary, ...thumbs].filter(Boolean);
        const seen = new Set();
        return nodes
          .map((img) => ({ src: img.src, alt: img.alt || "Project image" }))
          .filter((img) => {
            if (seen.has(img.src)) return false;
            seen.add(img.src);
            return true;
          });
      };

      const render = () => {
        if (!gallery.length) return;
        const current = gallery[currentIndex];
        lightboxImage.src = current.src;
        lightboxImage.alt = current.alt;
        lightboxCaption.textContent = `${currentIndex + 1} / ${gallery.length}`;
      };

      const open = (card, clickedSrc) => {
        gallery = uniqueImages(card);
        currentIndex = Math.max(0, gallery.findIndex((img) => img.src === clickedSrc));
        if (!gallery.length) return;
        lastFocused = document.activeElement;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        render();
        closeBtn.focus();
      };

      const close = () => {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
        document.body.style.overflow = "";
        if (lastFocused && typeof lastFocused.focus === "function") {
          lastFocused.focus();
        }
      };

      const next = () => {
        if (!gallery.length) return;
        currentIndex = (currentIndex + 1) % gallery.length;
        render();
      };

      const prev = () => {
        if (!gallery.length) return;
        currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
        render();
      };

      cards.forEach((card) => {
        card.addEventListener("click", (event) => {
          const clickedImage = event.target.closest("img");
          const startSrc = clickedImage?.src || card.querySelector(":scope > img")?.src || "";
          open(card, startSrc);
        });
      });

      closeBtn.addEventListener("click", close);
      nextBtn.addEventListener("click", next);
      prevBtn.addEventListener("click", prev);

      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) close();
      });

      document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("is-open")) return;
        if (event.key === "Escape") close();
        if (event.key === "ArrowRight") next();
        if (event.key === "ArrowLeft") prev();
      });
    })();
