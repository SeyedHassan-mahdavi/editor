import { Cairo, Amiri, Lateef, Tajawal, Vazirmatn } from '@next/font/google';

// فونت‌ها باید به صورت ثابت تعریف شوند
export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const lateef = Lateef({
  subsets: ['arabic'],
  weight: ['400'],
  display: 'swap',
});

export const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
});
