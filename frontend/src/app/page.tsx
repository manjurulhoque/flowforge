import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Features } from "@/components/landing/Features";
import { ValidationDeepDive } from "@/components/landing/ValidationDeepDive";
import { ExportSection } from "@/components/landing/ExportSection";
import { Workflow } from "@/components/landing/Workflow";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
	return (
		<>
			<Nav />
			<main className="pt-0">
				<Hero />
				<Problem />
				<Features />
				<ValidationDeepDive />
				<ExportSection />
				<Workflow />
				<Pricing />
				<Testimonials />
				<FinalCta />
			</main>
			<Footer />
		</>
	);
}
