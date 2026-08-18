(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    root.classList.add('v2-reduced-motion');
  }

  const storyShells = [...document.querySelectorAll('.v2-story-shell')];
  const projectVideos = [...document.querySelectorAll('.v2-project-video')];

  function pauseAllProjectVideos(except = null) {
    projectVideos.forEach((video) => {
      if (video === except) return;
      video.pause();
    });
  }

  function syncProjectVideo(panel, storyIsActive) {
    const video = panel?.querySelector('.v2-project-video');
    pauseAllProjectVideos(storyIsActive ? video : null);

    if (!(video instanceof HTMLVideoElement) || !storyIsActive || document.hidden) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }

  function activatePanel(shell, panels, nextIndex, storyIsActive = false) {
    const safeIndex = Math.max(0, Math.min(panels.length - 1, nextIndex));
    const currentIndex = Number(shell.dataset.storyActive ?? -1);

    shell.dataset.storyActive = String(safeIndex);
    panels.forEach((panel, index) => {
      const active = index === safeIndex;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
      panel.querySelectorAll('a, button, video').forEach((element) => {
        if (element instanceof HTMLVideoElement) return;
        element.tabIndex = active ? 0 : -1;
      });
    });

    if (currentIndex !== safeIndex || storyIsActive) {
      syncProjectVideo(panels[safeIndex], storyIsActive);
    }
  }

  function buildNativeStories() {
    root.classList.add('v2-native-story');
    const stories = storyShells.map((shell) => ({
      shell,
      panels: [...shell.querySelectorAll('[data-story-panel]')],
      activeIndex: 0,
    })).filter((story) => story.panels.length > 1);

    let ticking = false;

    const update = () => {
      ticking = false;
      if (window.innerWidth <= 900) {
        pauseAllProjectVideos();
        return;
      }

      stories.forEach((story) => {
        const rect = story.shell.getBoundingClientRect();
        const scrollable = Math.max(1, story.shell.offsetHeight - window.innerHeight);
        const progress = Math.min(0.999999, Math.max(0, -rect.top / scrollable));
        const isActive = rect.top <= 0 && rect.bottom >= window.innerHeight;
        const nextIndex = Math.min(story.panels.length - 1, Math.floor(progress * story.panels.length));
        story.shell.classList.toggle('is-progressing', isActive && progress > 0.025);

        if (nextIndex !== story.activeIndex) story.activeIndex = nextIndex;
        activatePanel(story.shell, story.panels, story.activeIndex, isActive);
      });
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
  }

  function buildPinnedStories() {
    if (reducedMotion) return;
    if (!window.gsap || !window.ScrollTrigger) {
      buildNativeStories();
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);
    const media = window.gsap.matchMedia();

    media.add('(min-width: 901px)', () => {
      const triggers = [];

      storyShells.forEach((shell) => {
        const pin = shell.querySelector('[data-story-pin]');
        const panels = [...shell.querySelectorAll('[data-story-panel]')];
        if (!pin || panels.length < 2) return;

        let activeIndex = 0;
        let isActive = false;
        activatePanel(shell, panels, 0, false);

        const trigger = window.ScrollTrigger.create({
          trigger: shell,
          start: 'top top',
          end: 'bottom bottom',
          pin,
          pinSpacing: false,
          scrub: 0.18,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle(self) {
            isActive = self.isActive;
            if (!isActive) {
              pauseAllProjectVideos();
              return;
            }
            activatePanel(shell, panels, activeIndex, true);
          },
          onUpdate(self) {
            const progress = Math.min(0.999999, Math.max(0, self.progress));
            const nextIndex = Math.min(panels.length - 1, Math.floor(progress * panels.length));
            shell.classList.toggle('is-progressing', progress > 0.025);

            if (nextIndex !== activeIndex) {
              activeIndex = nextIndex;
              activatePanel(shell, panels, activeIndex, isActive);
            }
          },
        });

        triggers.push(trigger);
      });

      window.ScrollTrigger.refresh();

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        pauseAllProjectVideos();
      };
    });
  }

  document.querySelectorAll('[data-v2-video-expand]').forEach((button) => {
    button.addEventListener('click', async () => {
      const video = button.closest('.v2-media-frame')?.querySelector('video');
      if (!(video instanceof HTMLVideoElement)) return;

      try {
        if (video.requestFullscreen) await video.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      } catch {
        // Fullscreen can be blocked by the browser. Native controls remain available.
      }
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAllProjectVideos();
  });

  buildPinnedStories();
})();
