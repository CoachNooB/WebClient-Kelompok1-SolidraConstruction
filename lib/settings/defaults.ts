export type CompanySettings = {
  name: string;
  email: string;
  phone: string;
  defaultLocale: "ID" | "EN";
  descriptionId?: string;
  descriptionEn?: string;
  socialLinks?: { linkedin?: string; instagram?: string; youtube?: string };
  defaultSeo?: { title: string; description: string };
};

export const defaultCompanySettings: CompanySettings = {
  name: "Solidra Construction",
  email: "info@solidra.co.id",
  phone: "+62215550142",
  defaultLocale: "ID",
  descriptionId: "Membangun fondasi kuat bagi masa depan Indonesia.",
  descriptionEn: "Building strong foundations for Indonesia's future.",
  socialLinks: {},
  defaultSeo: {
    title: "Solidra Construction",
    description:
      "Integrated construction and infrastructure partner in Indonesia.",
  },
};
