// Preference is separate from ownership: opening another tab never steals playback.
export function initAudio(config: { src: string; volume: number }) {
  if (!config.src) return;
  const button = document.querySelector<HTMLButtonElement>('#music')!,
    status = document.querySelector<HTMLElement>('#musicStatus')!;
  const audio = new Audio();
  audio.preload = 'none';
  audio.volume = config.volume;
  audio.loop = true;
  const preference = 'wedding:music:enabled',
    leaseKey = 'wedding:music:owner',
    id = crypto.randomUUID();
  const channel =
    'BroadcastChannel' in window ? new BroadcastChannel('wedding-music') : null;
  let release: (() => void) | undefined,
    heartbeat: ReturnType<typeof setInterval> | undefined,
    playing = false,
    starting = false,
    ready = false,
    operation = 0;
  const storage = {
    get: (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
  };
  function owner(): { id: string; expires: number } | null {
    try {
      return JSON.parse(storage.get(leaseKey) || 'null');
    } catch {
      return null;
    }
  }
  function view(label: string, busy = false) {
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-busy', String(busy));
    button.textContent = busy ? '…' : playing ? '♫' : '♪';
    status.textContent = label;
  }
  function stop() {
    operation++;
    audio.pause();
    playing = false;
    starting = false;
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = undefined;
    if (owner()?.id === id) storage.remove(leaseKey);
    release?.();
    release = undefined;
    view('Bật nhạc');
  }
  channel?.addEventListener('message', (e) => {
    if (e.data?.type === 'claim' && e.data.id !== id) stop();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === leaseKey && owner()?.id !== id && (playing || starting))
      stop();
    if (e.key === preference && e.newValue === 'false') stop();
  });
  async function play(explicit: boolean) {
    if (starting || playing) return;
    starting = true;
    const token = ++operation;
    if (explicit) {
      channel?.postMessage({ type: 'claim', id });
      storage.set(leaseKey, JSON.stringify({ id, expires: Date.now() + 8000 }));
    }
    const begin = async () => {
      if (token !== operation) return;
      const existing = owner();
      if (
        !explicit &&
        existing &&
        existing.id !== id &&
        existing.expires > Date.now()
      ) {
        starting = false;
        return;
      }
      const stored = storage.set(
        leaseKey,
        JSON.stringify({ id, expires: Date.now() + 8000 }),
      );
      if (!stored && !navigator.locks) {
        starting = false;
        view('Không thể đồng bộ các tab. Hãy cho phép lưu trữ để bật nhạc.');
        return;
      }
      if (stored)
        heartbeat = setInterval(() => {
          if (owner()?.id !== id) {
            stop();
            return;
          }
          storage.set(
            leaseKey,
            JSON.stringify({ id, expires: Date.now() + 8000 }),
          );
        }, 2000);
      view('Đang tải nhạc…', true);
      if (!audio.src) audio.src = config.src;
      try {
        await audio.play();
        if (token !== operation) {
          audio.pause();
          return;
        }
        playing = true;
        starting = false;
        view('Tắt nhạc');
      } catch {
        stop();
        view('Chạm để bật nhạc');
      }
    };
    if (navigator.locks) {
      // Explicit takeover requests the old tab to pause before acquiring its lock.
      if (explicit) await new Promise((resolve) => setTimeout(resolve, 120));
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        await navigator.locks.request(
          'wedding-audio',
          {
            mode: 'exclusive',
            ifAvailable: !explicit,
            signal: explicit ? controller.signal : undefined,
          },
          async (lock) => {
            clearTimeout(timeout);
            if (!lock) {
              starting = false;
              return;
            }
            await new Promise<void>(async (resolve) => {
              release = resolve;
              await begin();
              if (!playing) {
                release = undefined;
                resolve();
              }
            });
          },
        );
      } catch {
        starting = false;
        view('Chạm để thử bật nhạc lại');
      } finally {
        clearTimeout(timeout);
      }
    } else {
      if (explicit) await new Promise((resolve) => setTimeout(resolve, 160));
      if (token !== operation) return;
      if (explicit && owner()?.id !== id) {
        starting = false;
        return;
      }
      await begin();
    }
  }
  button.onclick = () => {
    if (playing || starting) {
      storage.set(preference, 'false');
      stop();
    } else {
      storage.set(preference, 'true');
      void play(true);
    }
  };
  audio.addEventListener('waiting', () => {
    if (playing) view('Nhạc đang tải thêm…', true);
  });
  audio.addEventListener('playing', () => {
    if (playing) view('Tắt nhạc');
  });
  audio.addEventListener('error', () => {
    stop();
    view('Không tải được nhạc. Chạm để thử lại.');
  });
  window.addEventListener(
    'hero-ready',
    () => {
      if (ready) return;
      ready = true;
      const connection = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (
        !connection?.saveData &&
        !['slow-2g', '2g'].includes(connection?.effectiveType || '')
      ) {
        audio.src = config.src;
        audio.preload = 'auto';
        audio.load();
      }
      if (storage.get(preference) === 'true') void play(false);
    },
    { once: true },
  );
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  view('Bật nhạc');
}
