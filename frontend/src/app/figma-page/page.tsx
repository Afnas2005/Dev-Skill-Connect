import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FigmaPage() {
    return (
        <div className="min-h-screen w-full bg-[#05091f] text-[#e8eeff]">
            <div className="w-full px-6 pb-10 pt-5 md:px-10">
                <header className="mb-16 flex items-center justify-between border-b border-[#1a2245] pb-4">
                    <Link href="/" className="text-sm font-semibold text-white">
                        DevSkill Connect
                    </Link>
                    <nav className="hidden items-center gap-8 text-xs text-[#9aa3c8] md:flex">
                        <span>Features</span>
                        <span>How It Works</span>
                        <span>Pricing</span>
                        <span>Community</span>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            className="h-8 border border-[#303a66] bg-transparent px-4 text-xs text-[#dce4ff] hover:bg-[#0e1534]"
                        >
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild className="h-8 bg-[#2d43ff] px-4 text-xs hover:bg-[#2236d1]">
                            <Link href="/register">Register</Link>
                        </Button>
                    </div>
                </header>

                <section className="grid gap-10 lg:grid-cols-2">
                    <div>
                        <p className="mb-6 inline-flex rounded-full border border-[#27326a] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#7380b8]">
                            THE FUTURE OF NETWORKING
                        </p>
                        <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
                            Connect with the World&apos;s Best <span className="text-[#2d43ff]">Full-Stack</span> Talent
                        </h1>
                        <p className="mt-6 max-w-xl text-sm leading-7 text-[#8b95bf]">
                            DevSkill Connect is the premier platform for full-stack developers to showcase technical expertise, verify skills, and build professional networks.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Button asChild className="bg-[#2d43ff] px-7 hover:bg-[#2236d1]">
                                <Link href="/register">Get Started for Free</Link>
                            </Button>
                            <Button
                                asChild
                                className="border border-[#303a66] bg-transparent px-7 text-[#dce4ff] hover:bg-[#0e1534]"
                            >
                                <Link href="/dashboard">View Demo</Link>
                            </Button>
                        </div>

                        <div className="mt-7 flex items-center gap-3 text-xs text-[#7f89b1]">
                            <div className="flex">
                                <span className="h-4 w-4 rounded-full bg-[#5a668f]" />
                                <span className="-ml-1 h-4 w-4 rounded-full bg-[#7a86ad]" />
                                <span className="-ml-1 h-4 w-4 rounded-full bg-[#9ba6ca]" />
                            </div>
                            <p>Join 10,000+ verified developers</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#1f2a55] bg-[#091330] p-8 shadow-[0_0_100px_-20px_rgba(61,89,255,0.45)]">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-20 flex-1 rounded-md border border-[#2b396d] bg-[#1b2548] p-3">
                                    <div className="mt-8 h-1.5 w-12 rounded bg-[#2d43ff]" />
                                </div>
                                <div className="h-20 flex-1 rounded-md border border-[#2b396d] bg-[#1b2548] p-3">
                                    <div className="mt-8 h-1.5 w-7 rounded bg-[#7f8cb7]" />
                                    <div className="mt-2 h-1.5 w-10 rounded bg-[#7f8cb7]" />
                                </div>
                            </div>
                            <div className="h-24 rounded-md border border-[#2b396d] bg-[#1b2548] p-3">
                                <div className="mb-4 h-3 w-3 rounded-full bg-[#2d43ff]" />
                                <div className="h-1.5 w-20 rounded bg-[#7f8cb7]" />
                                <div className="mt-2 h-1.5 w-32 rounded bg-[#55628e]" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-24 text-center">
                    <h2 className="text-4xl font-semibold text-white">Empowering Your Tech Career</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-[#8b95bf]">
                        Built by developers for developers, our platform provides the tools you need to stand out in the competitive tech landscape.
                    </p>
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-3">
                    <article className="rounded-xl border border-[#1f2a55] bg-[#091330] p-6">
                        <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#12225f] text-[#5e73ff]">SV</div>
                        <h3 className="text-lg font-semibold text-white">Skill Verification</h3>
                        <p className="mt-2 text-sm text-[#8b95bf]">
                            Get your technical skills validated through automated testing and peer review systems.
                        </p>
                    </article>
                    <article className="rounded-xl border border-[#1f2a55] bg-[#091330] p-6">
                        <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#12225f] text-[#5e73ff]">PH</div>
                        <h3 className="text-lg font-semibold text-white">Portfolio Hosting</h3>
                        <p className="mt-2 text-sm text-[#8b95bf]">
                            Host your full-stack projects with integrated GitHub support and live demo capabilities.
                        </p>
                    </article>
                    <article className="rounded-xl border border-[#1f2a55] bg-[#091330] p-6">
                        <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#12225f] text-[#5e73ff]">ES</div>
                        <h3 className="text-lg font-semibold text-white">Expert Search</h3>
                        <p className="mt-2 text-sm text-[#8b95bf]">
                            Find top-tier talent using advanced filters for tech stacks, experience levels, and ratings.
                        </p>
                    </article>
                </section>

                <section className="mt-20 w-full rounded-3xl border border-[#223066] bg-gradient-to-r from-[#0c1744] to-[#0c1f63] px-8 py-12 text-center">
                    <h2 className="text-5xl font-semibold text-white">Ready to join the community?</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-[#9ba7cc]">
                        Start building your developer profile today and connect with global opportunities in the modern tech landscape.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Button asChild className="bg-[#2d43ff] px-8 hover:bg-[#2236d1]">
                            <Link href="/register">Join Now</Link>
                        </Button>
                        <Button
                            asChild
                            className="border border-[#3a4a84] bg-transparent px-8 text-[#dce4ff] hover:bg-[#0e1534]"
                        >
                            <Link href="/">Contact Support</Link>
                        </Button>
                    </div>
                </section>

                <footer className="mt-16 border-t border-[#1a2245] pt-8 text-xs text-[#8b95bf]">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <p className="font-semibold text-white">DevSkill Connect</p>
                        <div className="flex flex-wrap gap-6">
                            <span>Terms of Service</span>
                            <span>Privacy Policy</span>
                            <span>Cookies Policy</span>
                            <span>Contact Us</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
