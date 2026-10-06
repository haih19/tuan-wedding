import { WeddingTheme, type WeddingConfig } from '../types/wedding';
// Replace the sample wedding information and assets here before publishing.
export const wedding: WeddingConfig = {
  theme: WeddingTheme.Elegant,
  monogram: 'T & L',
  couple: {
    bride: {
      name: 'Nguyễn Thuỳ Linh',
      shortName: 'Thuỳ Linh',
      parents: ['Con ông Nguyễn Văn A', 'và bà Trần Thị B'],
      portrait: '/images/bride.webp',
    },
    groom: {
      name: 'Lê Minh Tuấn',
      shortName: 'Minh Tuấn',
      parents: ['Con ông Lê Văn C', 'và bà Phạm Thị D'],
      portrait: '/images/groom.webp',
    },
  },
  events: {
    bride: {
      title: 'Lễ Vu Quy',
      date: '2026-12-20T10:30:00+07:00',
      venue: 'Tư gia nhà gái',
      address: 'Địa chỉ minh họa tại Hà Nội',
      mapUrl: 'https://www.google.com/maps?q=Hanoi',
      embedUrl: '',
    },
    groom: {
      title: 'Lễ Thành Hôn',
      date: '2026-12-20T17:00:00+07:00',
      venue: 'Tư gia nhà trai',
      address: 'Địa chỉ minh họa tại Hà Nội',
      mapUrl: 'https://www.google.com/maps?q=Hanoi',
      embedUrl: '',
    },
  },
  hero: {
    src: '/images/anh3.webp',
    alt: 'Ảnh cưới Minh Tuấn và Thuỳ Linh',
    width: 1365,
    height: 2048,
  },
  gallery: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((n, i) => ({
      src: `/images/anh${n}.webp`,
      alt: `Khoảnh khắc ảnh cưới ${n}`,
      width: [2048, 1365, 1365, 2048, 1707, 1707, 1707, 1706, 1707][i],
      height: [1365, 2048, 2048, 1365, 2560, 2560, 2560, 2560, 2560][i],
    }))
    .concat([
      {
        src: '/images/bride.webp',
        alt: 'Chân dung cô dâu',
        width: 600,
        height: 750,
      },
      {
        src: '/images/groom.webp',
        alt: 'Chân dung chú rể',
        width: 600,
        height: 750,
      },
    ]),
  story: [
    {
      date: 'Tháng 9 · 2020',
      title: 'Lần đầu gặp nhau',
      text: 'Trong buổi sinh nhật của một người bạn, chúng mình bắt đầu câu chuyện bằng một lời chào.',
    },
    {
      date: 'Tháng 12 · 2020',
      title: 'Một buổi hẹn thật dài',
      text: 'Cà phê đã nguội từ lâu, nhưng câu chuyện của hai đứa thì vẫn chưa hết.',
    },
    {
      date: 'Tháng 6 · 2023',
      title: 'Cùng nhau đi xa',
      text: 'Những chuyến đi, những bữa cơm và cả những ngày bình thường trở thành kỷ niệm quý nhất.',
    },
    {
      date: 'Tháng 12 · 2026',
      title: 'Về chung một nhà',
      text: 'Chúng mình chọn cùng nhau viết tiếp những ngày phía trước. Và mong bạn có mặt trong ngày bắt đầu ấy.',
    },
  ],
  gifts: {
    bride: {
      recipient: 'Nguyễn Thuỳ Linh',
      bank: '',
      account: '',
      qr: '/images/mock-qr.svg',
      isMock: true,
    },
    groom: {
      recipient: 'Lê Minh Tuấn',
      bank: '',
      account: '',
      qr: '/images/mock-qr.svg',
      isMock: true,
    },
  },
  music: { src: '/music/lam-vo-anh-nhe.mp3', volume: 0.35 },
  seo: {
    description:
      'Trân trọng kính mời bạn đến chung vui trong ngày cưới của Minh Tuấn và Thuỳ Linh.',
    image: '/images/anh1.webp',
  },
  copy: {
    heroLabel: 'Wedding',
    inviteEyebrow: 'Một ngày để nhớ, một đời bên nhau',
    inviteText:
      'Có những niềm vui chỉ thật trọn vẹn\nkhi được chia sẻ cùng người mình thương.',
    storyTitle: 'Từ một lần gặp,\nđến một đời thương.',
    storyIntro: 'Một vài khoảnh khắc nhỏ đã đưa chúng mình đến ngày hôm nay.',
    galleryTitle: 'Ngày thường cũng đẹp.',
    galleryIntro:
      'Lưu lại một chút hạnh phúc.\nChạm vào ảnh để xem trọn khoảnh khắc.',
    busNote:
      'Số chỗ xe bằng số người tham dự. Chú rể sẽ thông báo lịch xe trong nhóm Zalo.',
    footer: 'Cảm ơn bạn đã là một phần trong ngày vui của chúng mình.',
  },
};
export function eventDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
    .format(new Date(date))
    .replaceAll('/', '.');
}
export function eventTime(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(date));
}
export function eventDay(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(date));
}
