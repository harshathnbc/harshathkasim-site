export default function Footer() {
  return (
    <footer className="w-full border-t border-line/60 mt-24">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.16em] text-muted">
        <span dir="ltr">&copy; {new Date().getFullYear()} Harshath Kasim</span>
        <a
          href="mailto:hello@harshathkasim.com"
          dir="ltr"
          className="link-underline text-text-soft hover:text-text normal-case tracking-normal"
        >
          hello@harshathkasim.com
        </a>
      </div>
    </footer>
  );
}
