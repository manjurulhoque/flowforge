import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="px-5 sm:px-8 py-24 sm:py-32 border-t border-[var(--border)] text-center">
      <Reveal className="mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-4xl font-semibold text-[var(--text-primary)]">
          Design your first architecture in the next five minutes.
        </h2>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/register"
            className="group inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[#160b06] font-medium text-[14.5px] hover:bg-[var(--accent-strong)] transition-colors"
          >
            Start designing free
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <p className="mt-6 mono text-[12px] text-[var(--text-tertiary)]">
          git clone flowforge.app/quickstart
        </p>
      </Reveal>
    </section>
  );
}
