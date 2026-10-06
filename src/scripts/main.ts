import { initAudio } from './music';
import type { Photo, Gift, Side } from '../types/wedding';
const data = JSON.parse(
  document.querySelector('#weddingData')!.textContent!,
) as {
  gallery: Photo[];
  gifts: Record<Side, Gift>;
  music: { src: string; volume: number };
  monogram: string;
};
const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hero = $<HTMLElement>('.hero');
let entryTimer: ReturnType<typeof setTimeout>;
function entry() {
  document.querySelector('.envelope-screen')?.remove();
  clearTimeout(entryTimer);
  hero.classList.remove('motion-playing');
  if (!reduced.matches) hero.classList.add('motion-pending');
  const screen = document.createElement('div');
  screen.className = 'envelope-screen';
  screen.setAttribute('aria-hidden', 'true');
  screen.innerHTML =
    '<div class="invitation-leaf left"></div><div class="invitation-leaf right"></div><div class="wax-seal"></div>';
  screen.querySelector('.wax-seal')!.textContent = data.monogram;
  document.body.append(screen);
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    clearTimeout(entryTimer);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => screen.classList.add('opening')),
    );
    setTimeout(
      () => {
        hero.classList.remove('motion-pending');
        hero.classList.add('motion-playing');
      },
      reduced.matches ? 0 : 650,
    );
    setTimeout(() => screen.remove(), reduced.matches ? 0 : 1200);
    window.dispatchEvent(new Event('hero-ready'));
  };
  const image = $<HTMLImageElement>('#heroImage');
  if (image.complete)
    image
      .decode()
      .catch(() => {})
      .then(open);
  else {
    image.addEventListener(
      'load',
      () =>
        image
          .decode()
          .catch(() => {})
          .then(open),
      { once: true },
    );
    image.addEventListener('error', open, { once: true });
  }
  entryTimer = setTimeout(open, 3500);
}
initAudio(data.music);
entry();
$('#replay').onclick = entry;
const revealTargets = document.querySelectorAll<HTMLElement>(
  '.invite .wrap > *, .portrait, .story-intro, .moment, .venue-head, .venue, .gallery-heading, .photo, .wishes-grid > div, .form-panel, .rsvp-grid > div, .gift > .wrap > .caps, .gift > .wrap > .heading, .gift > .wrap > .intro, .gift-card, .footer',
);
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -24px 0px' },
  );
  revealTargets.forEach((el) => {
    el.classList.add('reveal-pending');
    observer.observe(el);
  });
  document.addEventListener('focusin', (e) =>
    (e.target as HTMLElement)
      .closest('.reveal-pending')
      ?.classList.add('is-visible'),
  );
  reduced.addEventListener(
    'change',
    (e) => {
      if (e.matches) {
        observer.disconnect();
        revealTargets.forEach((el) => el.classList.add('is-visible'));
        hero.classList.remove('motion-pending');
      }
    },
    { once: true },
  );
}
const date = new Date($('.countdown').dataset.date!).getTime();
function countdown() {
  const diff = Math.max(0, date - Date.now());
  for (const [id, unit, mod] of [
    ['days', 86400000, Infinity],
    ['hours', 3600000, 24],
    ['minutes', 60000, 60],
    ['seconds', 1000, 60],
  ] as const)
    $('#' + id).textContent = String(Math.floor(diff / unit) % mod).padStart(
      2,
      '0',
    );
}
countdown();
const clock = setInterval(countdown, 1000);
window.addEventListener('pagehide', () => clearInterval(clock));
let lastFocus: HTMLElement | null = null;
const lightbox = $<HTMLDialogElement>('#lightbox'),
  qr = $<HTMLDialogElement>('#qrDialog');
function show(dialog: HTMLDialogElement) {
  lastFocus = document.activeElement as HTMLElement;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
[lightbox, qr].forEach((dialog) => {
  dialog.querySelector<HTMLButtonElement>('.close')!.onclick = () =>
    dialog.close();
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
});
let current = 0;
function renderPhoto() {
  const photo = data.gallery[current];
  const image = $<HTMLImageElement>('#fullImage');
  image.src = photo.src;
  image.alt = photo.alt;
  lightbox.querySelector('.counter')!.textContent =
    `${current + 1} / ${data.gallery.length}`;
}
function move(delta: number) {
  current = (current + delta + data.gallery.length) % data.gallery.length;
  renderPhoto();
}
document.querySelectorAll<HTMLAnchorElement>('[data-photo]').forEach(
  (link) =>
    (link.onclick = (e) => {
      e.preventDefault();
      current = Number(link.dataset.photo);
      renderPhoto();
      show(lightbox);
    }),
);
lightbox.querySelector<HTMLButtonElement>('.prev')!.onclick = () => move(-1);
lightbox.querySelector<HTMLButtonElement>('.next')!.onclick = () => move(1);
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') move(-1);
  if (e.key === 'ArrowRight') move(1);
});
let touch: { x: number; y: number } | null = null;
lightbox.addEventListener(
  'touchstart',
  (e) => {
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  },
  { passive: true },
);
lightbox.addEventListener(
  'touchend',
  (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x,
      dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3)
      move(dx < 0 ? 1 : -1);
    touch = null;
  },
  { passive: true },
);
document.querySelectorAll<HTMLButtonElement>('[data-qr]').forEach(
  (button) =>
    (button.onclick = () => {
      const side = button.dataset.qr as Side,
        gift = data.gifts[side];
      $('#qrName').textContent = gift.recipient;
      $('#qrSide').textContent = side === 'bride' ? 'Gửi cô dâu' : 'Gửi chú rể';
      qr.querySelector<HTMLImageElement>('img')!.src = gift.qr;
      qr.querySelector<HTMLImageElement>('img')!.alt = `QR ${gift.recipient}`;
      $('#qrDetail').textContent = gift.isMock
        ? 'Ảnh minh họa, không dùng chuyển khoản.'
        : `${gift.bank} · ${gift.account}`;
      show(qr);
    }),
);
function near(elements: Element[], callback: (el: Element) => void) {
  if (!('IntersectionObserver' in window)) {
    elements.forEach(callback);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          observer.unobserve(e.target);
          callback(e.target);
        }
      }),
    { rootMargin: '250px' },
  );
  elements.forEach((el) => observer.observe(el));
}
near([...document.querySelectorAll<HTMLElement>('.map[data-embed]')], (el) => {
  const map = el as HTMLElement;
  if (!map.dataset.embed) return;
  const iframe = document.createElement('iframe');
  iframe.title = map.dataset.title!;
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  iframe.addEventListener('load', () =>
    map.querySelector('[role=status]')?.remove(),
  );
  iframe.src = map.dataset.embed;
  map.append(iframe);
});
const guestCount = $<HTMLInputElement>('#guestCount');
const guestCountValue = $<HTMLOutputElement>('#guestCountValue');
const guestCountButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-count-action]',
);
function setGuestCount(value: number) {
  const count = Math.min(20, Math.max(1, value));
  guestCount.value = String(count);
  guestCountValue.textContent = `${count} người`;
  guestCountButtons.forEach((button) => {
    button.disabled =
      (button.dataset.countAction === 'decrement' && count === 1) ||
      (button.dataset.countAction === 'increment' && count === 20);
  });
}
guestCountButtons.forEach((button) => {
  button.onclick = () =>
    setGuestCount(
      Number(guestCount.value) +
        (button.dataset.countAction === 'increment' ? 1 : -1),
    );
});
setGuestCount(1);
const attending =
  document.querySelectorAll<HTMLInputElement>('[name=attending]');
attending.forEach(
  (input) =>
    (input.onchange = () => {
      const absent = input.value === 'no';
      $('#attendanceFields').hidden = absent;
      document
        .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          '#attendanceFields input,#attendanceFields select',
        )
        .forEach((field) => (field.disabled = absent));
    }),
);
for (const [id, path] of [
  ['wishForm', 'wishes'],
  ['rsvpForm', 'rsvp'],
]) {
  const form = $<HTMLFormElement>('#' + id);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!,
      status = form.querySelector<HTMLElement>('.status')!;
    if (submit.disabled) return;
    submit.disabled = true;
    status.textContent = 'Đang gửi…';
    const values = new FormData(form);
    const payload =
      id === 'wishForm'
        ? {
            side: form.dataset.side,
            name: values.get('name'),
            message: values.get('message'),
            website: values.get('website'),
          }
        : {
            side: form.dataset.side,
            name: values.get('name'),
            phone: values.get('phone'),
            attending: values.get('attending') === 'yes',
            count: Number(values.get('count')),
            transport: values.get('transport'),
            website: values.get('website'),
          };
    try {
      const response = await fetch('/api/' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || 'Chưa gửi được, bạn vui lòng thử lại.');
      status.textContent =
        id === 'wishForm'
          ? 'Đã gửi lời chúc. Gia đình sẽ duyệt trước khi hiển thị.'
          : 'Đã lưu xác nhận tham dự. Bạn có thể gửi lại cùng số điện thoại để cập nhật.';
    } catch (error) {
      status.textContent =
        error instanceof Error && error.name === 'TimeoutError'
          ? 'Chưa nhận được xác nhận. Bạn vui lòng gửi lại để kiểm tra/cập nhật.'
          : error instanceof Error
            ? error.message
            : 'Chưa gửi được, vui lòng thử lại.';
    } finally {
      submit.disabled = false;
    }
  });
}
async function wishes() {
  const list = $('#wishList'),
    retry = $<HTMLButtonElement>('#retryWishes');
  retry.hidden = true;
  list.textContent = 'Đang tải lời chúc…';
  try {
    const response = await fetch(
      `/api/wishes?side=${document.body.dataset.side}`,
      { signal: AbortSignal.timeout(12000) },
    );
    if (!response.ok) throw new Error();
    const entries = (await response.json()) as {
      name: string;
      message: string;
    }[];
    list.replaceChildren();
    if (!entries.length)
      list.textContent = 'Hãy gửi lời chúc đầu tiên dành cho hai bạn.';
    entries.forEach((wish) => {
      const article = document.createElement('article');
      article.className = 'wish';
      const p = document.createElement('p'),
        name = document.createElement('small');
      p.textContent = wish.message;
      name.textContent = wish.name;
      article.append(p, name);
      list.append(article);
    });
  } catch {
    list.textContent =
      'Chưa tải được lời chúc. Bạn vẫn có thể gửi lời chúc bên cạnh.';
    retry.hidden = false;
  }
}
$('#retryWishes').onclick = wishes;
near([$('#wishes')], () => void wishes());
