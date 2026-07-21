const documentElement = document.documentElement;
const body = document.body;
const menuToggle = document.querySelector('#menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const mobileLinks = mobileMenu ? [...mobileMenu.querySelectorAll('a')] : [];
const revealItems = [...document.querySelectorAll('.reveal')];
const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
const sections = [...document.querySelectorAll('[data-section]')];
const typingElement = document.querySelector('#typing-text');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const projectCards = [...document.querySelectorAll('.project-card')];
const contactForm = document.querySelector('#contact-form');
const contactSubmit = document.querySelector('#contact-submit');
const formStatus = document.querySelector('#form-status');
const formStartedAt = document.querySelector('#form-started-at');

const currentLocale = document.documentElement.lang.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
const uiMessages = currentLocale === 'pt-BR'
  ? {
      reviewFields: 'Revise os campos obrigatórios antes de enviar.',
      sending: 'Enviando mensagem.',
      sendingButton: 'Enviando',
      sendButton: 'Enviar mensagem',
      sendSuccess: 'Mensagem enviada com sucesso. Obrigado pelo contato.',
      sendSuccessToast: 'Mensagem enviada com sucesso.',
      sendFailure: 'A mensagem não pôde ser enviada.',
      alternative: 'Use o WhatsApp ou o e-mail como alternativa.',
      menuOpen: 'Abrir menu de navegação',
      menuClose: 'Fechar menu de navegação',
    }
  : {
      reviewFields: 'Review the required fields before sending.',
      sending: 'Sending message.',
      sendingButton: 'Sending',
      sendButton: 'Send Message',
      sendSuccess: 'Message sent successfully. Thank you for reaching out.',
      sendSuccessToast: 'Message sent successfully.',
      sendFailure: 'The message could not be sent.',
      alternative: 'Use WhatsApp or email as an alternative.',
      menuOpen: 'Open navigation menu',
      menuClose: 'Close navigation menu',
    };

const toast = document.querySelector('#toast');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setMenuState(isOpen) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? uiMessages.menuClose : uiMessages.menuOpen);
  mobileMenu.classList.toggle('is-open', isOpen);
  body.classList.toggle('menu-open', isOpen);
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });
}

function updateActiveSection(sectionId) {
  sectionLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.sectionLink === sectionId);
  });
}

if ('IntersectionObserver' in window && sections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

      if (visibleEntries.length > 0) {
        updateActiveSection(visibleEntries[0].target.dataset.section);
      }
    },
    {
      rootMargin: '-25% 0px -55% 0px',
      threshold: [0.1, 0.25, 0.5],
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function startTyping() {
  if (!typingElement) return;

  const phrases = JSON.parse(typingElement.dataset.phrases || '[]');
  if (phrases.length === 0) return;

  if (reducedMotion) {
    typingElement.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  const tick = () => {
    const phrase = phrases[phraseIndex];
    typingElement.textContent = phrase.slice(0, characterIndex);

    if (!deleting && characterIndex < phrase.length) {
      characterIndex += 1;
      window.setTimeout(tick, 72);
      return;
    }

    if (!deleting && characterIndex === phrase.length) {
      deleting = true;
      window.setTimeout(tick, 1600);
      return;
    }

    if (deleting && characterIndex > 0) {
      characterIndex -= 1;
      window.setTimeout(tick, 38);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    window.setTimeout(tick, 360);
  };

  tick();
}

startTyping();

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';

    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));

    projectCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.hidden = !matches;
    });
  });
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3600);
}

function setFormStatus(message, type = '') {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove('is-success', 'is-error');
  if (type) formStatus.classList.add(`is-${type}`);
}

function validateContactForm(formData) {
  const requiredFields = ['name', 'email', 'subject', 'message'];
  let valid = true;

  requiredFields.forEach((fieldName) => {
    const field = contactForm?.elements.namedItem(fieldName);
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;

    const hasValue = field.value.trim().length > 0;
    field.classList.toggle('is-invalid', !hasValue);
    if (!hasValue) valid = false;
  });

  const emailField = contactForm?.elements.namedItem('email');
  if (emailField instanceof HTMLInputElement && emailField.value.trim()) {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim());
    emailField.classList.toggle('is-invalid', !emailValid);
    if (!emailValid) valid = false;
  }

  return valid && formData.get('website') === '';
}

if (formStartedAt) {
  formStartedAt.value = String(Date.now());
}

if (contactForm) {
  contactForm.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.classList.remove('is-invalid');
    }
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    if (!validateContactForm(formData)) {
      setFormStatus(uiMessages.reviewFields, 'error');
      return;
    }

    const payload = Object.fromEntries(formData.entries());
    setFormStatus(uiMessages.sending);

    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.textContent = uiMessages.sendingButton;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || uiMessages.sendFailure);
      }

      contactForm.reset();
      if (formStartedAt) formStartedAt.value = String(Date.now());
      setFormStatus(uiMessages.sendSuccess, 'success');
      showToast(uiMessages.sendSuccessToast);
    } catch (error) {
      const message = error instanceof Error ? error.message : uiMessages.sendFailure;
      setFormStatus(`${message} ${uiMessages.alternative}`, 'error');
    } finally {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.textContent = uiMessages.sendButton;
      }
    }
  });
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

documentElement.classList.add('site-ready');

document.querySelectorAll('[data-print-page]').forEach((button) => {
  button.addEventListener('click', () => window.print());
});

function initializeFeaturedProjectsCarousel() {
  const track = document.querySelector('#featured-projects-carousel');
  const previousButton = document.querySelector('[data-projects-previous]');
  const nextButton = document.querySelector('[data-projects-next]');
  const dotsContainer = document.querySelector('[data-projects-dots]');
  const countElement = document.querySelector('[data-projects-count]');

  if (!track || !previousButton || !nextButton) return;

  const originalSlides = [...track.querySelectorAll(':scope > .case-study')];
  if (originalSlides.length < 2) return;

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides.at(-1).cloneNode(true);

  [firstClone, lastClone].forEach((clone) => {
    clone.classList.remove('reveal');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button, video').forEach((element) => {
      element.setAttribute('tabindex', '-1');
    });
  });

  track.append(firstClone);
  track.prepend(lastClone);

  const slides = [...track.querySelectorAll(':scope > .case-study')];

  slides.forEach((slide) => {
    const video = slide.querySelector('.project-demo');
    if (!(video instanceof HTMLVideoElement)) return;

    const shell = slide.querySelector('.project-demo-shell');
    const markVideoReady = () => shell?.classList.add('has-video');
    const markVideoUnavailable = () => {
      shell?.classList.add('video-unavailable');
      video.controls = false;
    };

    if (video.readyState >= 2) markVideoReady();
    video.addEventListener('loadeddata', markVideoReady, { once: true });
    video.addEventListener('error', markVideoUnavailable, { once: true });
    video.querySelector('source')?.addEventListener('error', markVideoUnavailable, { once: true });
  });

  const total = originalSlides.length;
  let position = 1;
  let locked = false;
  let touchStartX = 0;

  if (dotsContainer) {
    dotsContainer.replaceChildren();
    originalSlides.forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'projects-carousel-dot';
      dotsContainer.append(dot);
    });
  }

  const getCurrentProject = () => {
    if (position === 0) return total;
    if (position === slides.length - 1) return 1;
    return position;
  };

  const syncVideos = () => {
    slides.forEach((slide, index) => {
      const video = slide.querySelector('.project-demo');
      if (!(video instanceof HTMLVideoElement)) return;

      const unavailable = slide.querySelector('.project-demo-shell')?.classList.contains('video-unavailable');
      video.controls = !unavailable;
      video.autoplay = false;
      video.removeAttribute('autoplay');

      const isActive = index === position;
      if (!isActive || document.hidden) {
        video.pause();
        if (!isActive) {
          try {
            video.currentTime = 0;
          } catch {
            // Media metadata may not be available yet.
          }
        }
      }
    });
  };

  const updateAccessibility = () => {
    slides.forEach((slide, index) => {
      const isClone = index === 0 || index === slides.length - 1;
      const isActive = index === position && !isClone;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.querySelectorAll('a, button').forEach((element) => {
        element.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    });

    const current = getCurrentProject();
    if (dotsContainer) {
      [...dotsContainer.children].forEach((dot, index) => {
        dot.classList.toggle('is-active', index === current - 1);
      });
    }
    if (countElement) countElement.textContent = `${current} / ${total}`;
    syncVideos();
  };

  const moveTo = (nextPosition, animate = true) => {
    if (locked && animate) return;
    position = nextPosition;
    track.classList.toggle('is-animating', animate);
    locked = animate;
    requestAnimationFrame(() => {
      track.style.transform = `translate3d(-${position * 100}%, 0, 0)`;
      updateAccessibility();
    });
  };

  const next = () => moveTo(position + 1);
  const previous = () => moveTo(position - 1);

  nextButton.addEventListener('click', next);
  previousButton.addEventListener('click', previous);

  track.addEventListener('transitionend', () => {
    track.classList.remove('is-animating');
    locked = false;

    if (position === slides.length - 1) {
      moveTo(1, false);
    } else if (position === 0) {
      moveTo(slides.length - 2, false);
    }
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  });

  track.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    distance > 0 ? previous() : next();
  }, { passive: true });

  document.addEventListener('visibilitychange', syncVideos);
  moveTo(1, false);
}

initializeFeaturedProjectsCarousel();


document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-video-expand]');
  if (!(button instanceof HTMLButtonElement)) return;

  const shell = button.closest('.project-demo-shell');
  const video = shell?.querySelector('.project-demo');
  if (!(video instanceof HTMLVideoElement)) return;

  if (typeof video.requestFullscreen === 'function') {
    video.requestFullscreen().catch(() => {});
    return;
  }

  if (typeof video.webkitEnterFullscreen === 'function') {
    video.webkitEnterFullscreen();
  }
});


document.addEventListener('play', (event) => {
  const currentVideo = event.target;
  if (!(currentVideo instanceof HTMLVideoElement) || !currentVideo.matches('#projects .project-demo')) {
    return;
  }

  document.querySelectorAll('#projects .project-demo').forEach((video) => {
    if (video !== currentVideo) {
      video.pause();
    }
  });
}, true);
