import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
      <p className="font-display text-3xl text-ink mb-3">Package not found</p>
      <p className="text-ink/60 mb-6">This package doesn&apos;t exist or is no longer active.</p>
      <Link href="/packages" className="text-route underline underline-offset-4">
        Back to all packages
      </Link>
    </div>
  );
}
