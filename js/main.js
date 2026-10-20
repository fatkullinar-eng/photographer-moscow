/* ==========================================================================
   Анна Морозова — фотограф в Москве
   Логика страницы: меню, появление блоков, лайтбокс, форма записи.
   ========================================================================== */

/* --------------------------------------------------------------------------
   КУДА УХОДЯТ ЗАЯВКИ
   formEndpoint — адрес сервиса, который принимает заявку и пересылает её
   на почту. Пока строка пустая, форма честно сообщает, что отправка
   не подключена.
   contactEmail — адрес для сообщений «напишите мне напрямую», если
   отправка не удалась.
   -------------------------------------------------------------------------- */
const CONFIG = {
  // Web3Forms принимает заявку и пересылает её на почту, указанную при
  // получении ключа. Ключ выдаётся бесплатно на web3forms.com.
  formEndpoint: "https://api.web3forms.com/submit",
  formAccessKey: "bbfbb543-f03b-415d-b310-68c3506f9f7b",
  contactEmail: "local-bar-bm@yandex.ru",
  telegramUsername: "anna_photomsk",
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
  initReveal();
  initLightbox();
  initTariffLinks();
  initForm();
  setYear();
});

/* ---------- Шапка: тонкая линия после прокрутки ---------- */

function initHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Мобильное меню ---------- */

function initMenu() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const backdrop = document.getElementById("menu-backdrop");
  if (!burger || !nav || !backdrop) return;

  const setOpen = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);

    if (open) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("is-open"));
    } else {
      backdrop.classList.remove("is-open");
      window.setTimeout(() => {
        if (!nav.classList.contains("is-open")) backdrop.hidden = true;
      }, 300);
    }
  };

  burger.addEventListener("click", () => {
    setOpen(burger.getAttribute("aria-expanded") !== "true");
  });

  backdrop.addEventListener("click", () => setOpen(false));

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      burger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && nav.classList.contains("is-open")) setOpen(false);
  });
}

/* ---------- Плавное появление секций ---------- */

function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Проверяем положение блоков на каждом кадре прокрутки.
  // Такой способ не пропускает элементы даже при очень быстрой прокрутке.
  const check = () => {
    const limit = window.innerHeight - 40;
    items.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      if (el.getBoundingClientRect().top < limit) el.classList.add("is-visible");
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      check();
      ticking = false;
    });
  };

  check();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", check);
}

/* ---------- Галерея: просмотр на весь экран ---------- */

function initLightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  const caption = document.getElementById("lb-caption");
  const counter = document.getElementById("lb-counter");
  const btnClose = document.getElementById("lb-close");
  const btnPrev = document.getElementById("lb-prev");
  const btnNext = document.getElementById("lb-next");
  const tiles = Array.from(document.querySelectorAll(".tile[data-full]"));
  if (!box || !img || !tiles.length) return;

  const slides = tiles.map((tile) => ({
    src: tile.dataset.full,
    caption: tile.dataset.caption || "",
    alt: tile.querySelector("img")?.alt || "",
    tile,
  }));

  let index = 0;
  let lastFocused = null;

  const render = () => {
    const slide = slides[index];
    img.src = slide.src;
    img.alt = slide.alt;
    caption.textContent = slide.caption;
    counter.textContent = `${index + 1} / ${slides.length}`;
  };

  const open = (i) => {
    index = i;
    lastFocused = document.activeElement;
    render();
    box.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => box.classList.add("is-open"));
    btnClose.focus();
  };

  const close = () => {
    box.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      box.hidden = true;
      img.removeAttribute("src");
    }, 260);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  const step = (dir) => {
    index = (index + dir + slides.length) % slides.length;
    render();
  };

  tiles.forEach((tile, i) => {
    tile.addEventListener("click", () => open(i));
  });

  const allBtn = document.getElementById("gallery-all");
  if (allBtn) allBtn.addEventListener("click", () => open(0));

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => step(-1));
  btnNext.addEventListener("click", () => step(1));

  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
    if (e.key === "Tab") {
      // Удерживаем фокус внутри окна просмотра
      const focusable = [btnClose, btnPrev, btnNext];
      const current = document.activeElement;
      const pos = focusable.indexOf(current);
      e.preventDefault();
      const next = e.shiftKey ? (pos - 1 + focusable.length) % focusable.length : (pos + 1) % focusable.length;
      focusable[next].focus();
    }
  });
}

/* ---------- Кнопки тарифов: подсказка в форме ---------- */

function initTariffLinks() {
  const comment = document.getElementById("comment");
  const form = document.getElementById("booking-form");
  if (!comment || !form) return;

  document.querySelectorAll("[data-tariff]").forEach((link) => {
    link.addEventListener("click", () => {
      const tariff = link.dataset.tariff;
      if (!comment.value.trim()) {
        comment.value = `Интересует тариф ${tariff}.`;
      }
      window.setTimeout(() => {
        const name = document.getElementById("name");
        if (name) name.focus({ preventScroll: true });
      }, 600);
    });
  });
}

/* ---------- Форма записи ---------- */

function initForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const fields = {
    name: form.querySelector("#name"),
    contact: form.querySelector("#contact"),
    type: form.querySelector("#type"),
    consent: form.querySelector("#consent"),
  };

  const errors = {
    name: document.getElementById("name-error"),
    contact: document.getElementById("contact-error"),
    type: document.getElementById("type-error"),
    consent: document.getElementById("consent-error"),
  };

  const fallbackContact = CONFIG.contactEmail
    ? `Напишите мне на почту: ${CONFIG.contactEmail}`
    : `Напишите мне в Telegram: @${CONFIG.telegramUsername}`;

  const setError = (key, message) => {
    const input = fields[key];
    const box = errors[key];
    if (box) box.textContent = message || "";
    const wrapper = input?.closest(".field");
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
  };

  const clearStatus = () => {
    status.textContent = "";
    status.className = "form__status";
  };

  // Убираем ошибку, как только человек начал исправлять поле
  Object.entries(fields).forEach(([key, input]) => {
    if (!input) return;
    const eventName = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventName, () => setError(key, ""));
  });

  const isPhone = (value) => {
    const digits = value.replace(/[^\d]/g, "");
    return digits.length >= 10 && digits.length <= 15;
  };
  const isTelegram = (value) => /^@[A-Za-z0-9_]{4,32}$/.test(value.trim());

  const validate = () => {
    let firstInvalid = null;

    if (fields.name.value.trim().length < 2) {
      setError("name", "Напишите, как к вам обращаться.");
      firstInvalid = firstInvalid || fields.name;
    }

    const contact = fields.contact.value.trim();
    if (!contact) {
      setError("contact", "Оставьте телефон или имя в Telegram.");
      firstInvalid = firstInvalid || fields.contact;
    } else if (!isPhone(contact) && !isTelegram(contact)) {
      setError("contact", "Проверьте номер: нужно не меньше 10 цифр, либо @username в Telegram.");
      firstInvalid = firstInvalid || fields.contact;
    }

    if (!fields.type.value) {
      setError("type", "Выберите тип фотосессии.");
      firstInvalid = firstInvalid || fields.type;
    }

    if (!fields.consent.checked) {
      setError("consent", "Без согласия на обработку данных я не смогу принять заявку.");
      firstInvalid = firstInvalid || fields.consent;
    }

    return firstInvalid;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const invalid = validate();
    if (invalid) {
      status.textContent = "Проверьте выделенные поля — чего-то не хватает.";
      status.classList.add("is-error");
      invalid.focus();
      return;
    }

    // Скрытое поле-ловушка: человек его не видит, бот заполняет.
    // Если оно не пустое — заявку молча игнорируем.
    const honey = form.querySelector('input[name="botcheck"]');
    if (honey && honey.value) return;

    const payload = {
      access_key: CONFIG.formAccessKey,
      subject: "Новая заявка на фотосессию",
      from_name: "Сайт фотографа",
      name: fields.name.value.trim(),
      contact: fields.contact.value.trim(),
      type: fields.type.value,
      date: form.querySelector("#date").value,
      comment: form.querySelector("#comment").value.trim(),
      consent: "да",
      page: window.location.href,
      sentAt: new Date().toISOString(),
    };

    // Защита от повторной отправки
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправляю…";

    try {
      if (!CONFIG.formEndpoint || !CONFIG.formAccessKey) {
        // Отправка ещё не подключена — честно говорим об этом
        status.textContent =
          `Форма пока не подключена к отправке. ${fallbackContact} — и я предложу свободные даты.`;
        status.classList.add("is-error");
        return;
      }

      const response = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Сервисы вроде FormSubmit отвечают 200 и полем success
      const data = await response.json().catch(() => ({}));
      if (String(data.success) === "false" || data.ok === false) {
        throw new Error(data.message || "Сервис отклонил заявку");
      }

      form.reset();
      status.textContent =
        "Спасибо! Заявка отправлена. Я свяжусь с вами, чтобы обсудить дату и детали съёмки.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent =
        `Не удалось отправить заявку. Попробуйте ещё раз. ${fallbackContact}.`;
      status.classList.add("is-error");
      console.error("Ошибка отправки формы:", error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Выбрать дату фотосессии";
    }
  });
}

/* ---------- Год в подвале ---------- */

function setYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}
