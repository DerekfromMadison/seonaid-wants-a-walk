export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-slate-100">
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center sm:items-start sm:text-left">
        <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          London Walk Companion
        </span>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Craft time-perfect walking adventures that blend London streets with timely Tube hops.
        </h1>
        <p className="text-base leading-7 text-slate-300 sm:text-lg">
          This MVP scaffold ships with documentation, architecture notes, and an implementation roadmap.
          Begin with Phase&nbsp;1 from the TODO list to hook up location capture and destination search.
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm sm:flex-row">
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-slate-100 px-6 py-3 font-semibold text-slate-950 transition hover:bg-white"
        >
          Next.js docs
        </a>
        <a
          href="https://tanstack.com/query/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-slate-600 px-6 py-3 font-medium text-slate-200 transition hover:bg-slate-800/70"
        >
          React Query guide
        </a>
      </div>
    </main>
  );
}
