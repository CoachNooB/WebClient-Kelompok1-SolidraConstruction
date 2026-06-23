import type { Locale } from "./i18n";
export const copy = {
  id: {
    home: {
      eye: "Membangun Indonesia",
      title: "Konstruksi andal untuk masa depan yang berkelanjutan",
      desc: "Solidra menghadirkan solusi konstruksi terpadu dengan standar keselamatan tinggi dan ketepatan tanpa kompromi.",
    },
    about: {
      eye: "Tentang Solidra",
      title: "Membangun kepercayaan sejak 1998",
      desc: "Kami adalah perusahaan konstruksi Indonesia yang menggabungkan pengalaman lapangan, teknologi, dan tata kelola kuat.",
    },
    investors: {
      eye: "Hubungan Investor",
      title: "Pertumbuhan disiplin. Nilai jangka panjang.",
      desc: "Informasi transparan mengenai kinerja, tata kelola, dan arah strategis Solidra Construction.",
    },
    contact: {
      eye: "Hubungi Kami",
      title: "Mari membangun sesuatu yang berarti",
      desc: "Diskusikan kebutuhan proyek, kemitraan, atau pertanyaan perusahaan bersama tim kami.",
    },
    careers: {
      eye: "Karier di Solidra",
      title: "Bangun karier. Bentuk masa depan.",
      desc: "Bekerja bersama talenta terbaik untuk menyelesaikan proyek yang memberi dampak nyata.",
    },
  },
  en: {
    home: {
      eye: "Building Indonesia",
      title: "Reliable construction for a sustainable future",
      desc: "Solidra delivers integrated construction solutions with uncompromising safety, quality, and precision.",
    },
    about: {
      eye: "About Solidra",
      title: "Building trust since 1998",
      desc: "We are an Indonesian construction company combining field experience, technology, and strong governance.",
    },
    investors: {
      eye: "Investor Relations",
      title: "Disciplined growth. Long-term value.",
      desc: "Transparent information about Solidra Construction's performance, governance, and strategic direction.",
    },
    contact: {
      eye: "Contact Us",
      title: "Let's build something meaningful",
      desc: "Discuss your project, partnership, or corporate inquiry with our team.",
    },
    careers: {
      eye: "Careers at Solidra",
      title: "Build your career. Shape the future.",
      desc: "Work with exceptional people to deliver projects that create lasting impact.",
    },
  },
} as const;
export const vacancies = [
  {
    id: "site-engineer",
    department: "Operations",
    location: "Jakarta",
    type: "Full-time",
  },
  {
    id: "quantity-surveyor",
    department: "Commercial",
    location: "Surabaya",
    type: "Full-time",
  },
  {
    id: "hse-officer",
    department: "Safety",
    location: "Bandung",
    type: "Contract",
  },
];
export function c(locale: Locale) {
  return copy[locale];
}
