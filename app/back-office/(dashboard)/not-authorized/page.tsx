import { BackButton } from "@/components/back-office/back-button";

export default function NotAuthorized() {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="eyebrow">Back office</p>
      <h1 className="mt-3 text-3xl font-black">Not authorized</h1>
      <p className="mt-4 leading-7 text-slate-600">
        Your account does not have permission to access this page.
      </p>
      <div className="mt-6 flex justify-center">
        <BackButton />
      </div>
    </section>
  );
}
