import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({
  newsletter,
}: {
  newsletter: Dictionary["newsletter"];
}) {
  return (
    <footer className="w-full border-t border-line/60 mt-24">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Newsletter signup (Buttondown) */}
        <div className="max-w-xl">
          <p className="text-sm text-text-soft mb-3">{newsletter.heading}</p>
          <form
            action="https://buttondown.email/api/emails/embed-subscribe/harshath"
            method="post"
            target="_blank"
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              name="email"
              required
              dir="ltr"
              placeholder={newsletter.placeholder}
              aria-label={newsletter.placeholder}
              className="flex-1 rounded-lg border border-line/60 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent/60 focus:outline-none"
            />
            <button type="submit" className="btn-glass px-5 py-2.5 text-sm text-text whitespace-nowrap">
              {newsletter.button}
            </button>
          </form>
        </div>

        <div className="mt-10 pt-8 border-t border-line/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.16em] text-muted">
          <span dir="ltr">&copy; {new Date().getFullYear()} Harshath Kasim</span>
          <a
            href="mailto:hello@harshathkasim.com"
            dir="ltr"
            className="link-underline text-text-soft hover:text-text normal-case tracking-normal"
          >
            hello@harshathkasim.com
          </a>
        </div>
      </div>
    </footer>
  );
}
