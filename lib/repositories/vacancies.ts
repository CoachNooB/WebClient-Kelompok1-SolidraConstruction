export type VacancyEligibility = {
  status: "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";
  publishedAt: Date | null;
  closingDate: Date;
};

export function isVacancyEligible(
  vacancy: VacancyEligibility,
  now = new Date(),
): boolean {
  return (
    vacancy.status === "OPEN" &&
    vacancy.publishedAt !== null &&
    vacancy.closingDate.getTime() >= now.getTime()
  );
}
