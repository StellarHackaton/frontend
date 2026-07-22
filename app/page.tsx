import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/ui/Wordmark";
import { Reveal } from "@/components/ui/Reveal";
import { formatRp } from "@/lib/format";
import { PaymentIcon } from "@/components/ui/PaymentIcon";
import { PhoneHero } from "@/components/ui/PhoneHero";

const PAY_METHODS = [
  { code: "EURC",  name: "Euro"           },
  { code: "USDC",  name: "Dollar"         },
  { code: "PYUSD", name: "PayPal Dollar"  },
  { code: "XLM",   name: "Stellar Balance"},
];

const STEPS = [
  {
    title: "Create a product",
    body: "Set a normal price. We handle the rest.",
    img: "/icons/steps/product-card.png",
  },
  {
    title: "Share the link or QR",
    body: "Send it anywhere your buyers already are.",
    img: "/icons/steps/payment-link.png",
  },
  {
    title: "Get paid",
    body: "Buyers pay with any balance. You receive exact dollars.",
    img: "/icons/steps/paid-chip.png",
  },
];

const PERKS = [
  "Unlimited products and payment links",
  "Instant links and QR for every product",
  "Receipts and proof on every order",
  "Buyers pay with any balance they hold",
];

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c.6 5.6 1.4 8.6 4 11.2C13.4 13.8 12.6 16.8 12 24c-.6-7.2-1.4-10.2-4-12.8C10.6 8.6 11.4 5.6 12 0z" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* navbar */}
      <header className="flex h-[72px] items-center justify-between border-b border-ink/[.06] px-5 sm:px-14">
        <Wordmark size={22} />
        <nav className="hidden items-center gap-9 text-[15px] md:flex">
          <a href="#product" className="text-muted transition-colors hover:text-ink">Product</a>
          <a href="#how-it-works" className="text-muted transition-colors hover:text-ink">How it works</a>
          <a href="#pricing" className="text-muted transition-colors hover:text-ink">Pricing</a>
        </nav>
        <div className="flex items-center gap-3.5">
          <Link href="/login" className="hidden text-[15px] text-muted sm:inline">
            Sign in
          </Link>
          <Link
            href="/login"
            className="liquid-surface rounded-btn px-5 py-2.5 text-center font-display text-[15px] font-semibold text-white"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* hero */}
      <section
        id="product"
        className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 sm:px-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-12 lg:py-[88px]"
      >
        <Reveal className="order-1 lg:order-none lg:col-start-1 lg:row-start-1">
          <h1 className="font-display text-[36px] font-extrabold leading-[1.04] tracking-[-.035em] sm:text-[62px]">
            Get paid in any balance. Receive exact dollars.
          </h1>
          <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-muted sm:mt-6 sm:text-[19px]">
            Lunas turns any balance your customer holds into the exact amount you
            asked for. One tap. No jargon.
          </p>
        </Reveal>

        {/* hero phone — raised above the CTAs on mobile, scaled down so it
            never overflows the fold; full size again at the lg breakpoint */}
        <Reveal delay={0.1} className="order-2 flex justify-center lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="-my-16 scale-[0.72] sm:-my-10 sm:scale-[0.85] lg:my-0 lg:scale-100">
            <PhoneHero />
          </div>
        </Reveal>

        <Reveal className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <Link
              href="/login"
              className="liquid-surface rounded-btn px-7 py-[14px] text-center font-display text-base font-semibold text-white"
            >
              Get started
            </Link>
            <Link
              href="/pay/sunset-a3"
              className="liquid-glass !border-primary/40 rounded-btn px-7 py-[14px] text-center font-display text-base font-semibold text-primary"
            >
              See how it works
            </Link>
          </div>

          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4-4 8-7.58 8-12a8 8 0 1 0-16 0c0 4.42 4 8 8 12Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Need testnet USDC on Base? Get some from the Circle faucet
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10v10M7 17 17 7" />
            </svg>
          </a>
        </Reveal>
      </section>

      {/* trust strip */}
      <section className="border-t border-ink/[.06] px-5 py-10 text-center sm:px-14">
        <div className="mb-5 text-[13px] text-faint">
          Works with the money people already have
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {PAY_METHODS.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-2.5 rounded-btn border border-ink/[.08] bg-white px-[18px] py-2.5 shadow-[0_2px_8px_rgba(0,0,0,.04)]"
            >
              <div className="overflow-hidden rounded-[8px] shadow-[0_1px_4px_rgba(0,0,0,.12)]">
                <PaymentIcon code={m.code} size={26} radius={8} />
              </div>
              <span className="font-display text-[15px] font-semibold">
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how-it-works" className="px-5 py-16 sm:px-14 sm:py-20">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-[30px] font-bold tracking-[-.025em] sm:text-[38px]">
            How it works
          </h2>
          <p className="mt-3 text-[17px] text-muted">
            Three steps. No setup, no jargon.
          </p>
        </Reveal>
        {/* compact mobile version — icon + title only, no cards */}
        <div className="mx-auto flex max-w-[420px] flex-col gap-2.5 md:hidden">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.06}
              className="flex items-center gap-3 rounded-[18px] border border-ink/[.07] bg-white px-4 py-3"
            >
              <Image src={s.img} alt="" width={80} height={80} className="h-9 w-9 flex-none object-contain" />
              <div className="min-w-0">
                <div className="font-display text-[15px] font-bold">{s.title}</div>
                <div className="truncate text-[12.5px] text-muted">{s.body}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* full card grid — desktop/tablet */}
        <div className="mx-auto hidden max-w-[1100px] gap-6 md:grid md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.08}
              className="rounded-card border border-ink/[.08] bg-white p-8"
            >
              <div className="mb-5 flex h-24 w-24 items-center justify-center">
                <Image
                  src={s.img}
                  alt=""
                  width={200}
                  height={200}
                  className="h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(47,42,107,.18)]"
                />
              </div>
              <div className="font-display text-[21px] font-bold">{s.title}</div>
              <div className="mt-2.5 text-[15px] leading-[1.55] text-muted">
                {s.body}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* value blocks */}
      <section className="flex flex-col gap-8 px-5 pb-16 sm:px-14">
        <Reveal>
        <ValueBlock
          title="Your buyers pay with what they already have"
          body="They keep their balance, you keep it simple. No top ups, no detours, no new accounts to open."
        >
          <div className="flex w-full flex-col gap-2.5">
            <PickRow code="EURC"  name="Euro" selected />
            <PickRow code="USDC"  name="Dollar" approx="≈ $5.00" />
            <PickRow code="PYUSD" name="PayPal Dollar" approx="≈ $5.02" />
          </div>
        </ValueBlock>
        </Reveal>

        <Reveal>
        <ValueBlock
          title="You always receive the exact amount"
          body="Ask for $5, get $5. Lunas matches it for you behind the scenes, so the number you set is the number you keep."
          reverse
          hideBodyOnMobile
        >
          <div className="text-center">
            <div className="mb-2 text-[13px] uppercase tracking-[.1em] text-muted">
              You receive
            </div>
            <div className="tnum font-display text-[60px] font-extrabold tracking-[-.04em]">
              $5.00
            </div>
            <div className="mt-2 text-sm text-muted">
              exactly what you asked for
            </div>
          </div>
        </ValueBlock>
        </Reveal>
      </section>

      {/* pricing */}
      <span id="pricing" />
      <section
        className="border-t border-ink/[.06] px-5 py-16 sm:px-14 sm:py-20"
        style={{ background: "linear-gradient(180deg, #F8F7F4 0%, #EFEDE8 100%)" }}
      >
        <div className="mb-10 text-center">
          <h2 className="font-display text-[30px] font-bold tracking-[-.025em] sm:text-[38px]">
            Honest pricing
          </h2>
          <p className="mt-3 text-[17px] text-muted">One plan. No surprises.</p>
        </div>

        <Reveal className="liquid-glass relative mx-auto max-w-[400px] overflow-hidden rounded-[28px] p-7 text-center sm:p-9">
          {/* decorative icon: receipt + checkmark badge, with sparkle accents —
              desktop only, pure flourish that just adds scroll height on mobile */}
          <div className="relative mx-auto mb-6 hidden h-[80px] w-[104px] sm:block">
            <Sparkle className="absolute -left-1 top-0 h-3 w-3 text-[#F472B6]" />
            <Sparkle className="absolute right-2 top-6 h-2 w-2 text-[#FBBF24]" />
            <Sparkle className="absolute left-3 bottom-0 h-2.5 w-2.5 text-[#38BDF8]" />

            {/* receipt, back layer */}
            <div className="absolute right-1 top-4 h-[68px] w-[50px] rotate-[9deg] rounded-[11px] bg-white p-2.5 shadow-[0_8px_18px_rgba(21,22,27,.14)]">
              <div className="h-[2px] w-full rounded bg-ink/[.09]" />
              <div className="mt-1.5 h-[2px] w-[85%] rounded bg-ink/[.09]" />
              <div className="mt-1.5 h-[2px] w-full rounded bg-ink/[.09]" />
              <div className="mt-1.5 h-[2px] w-[60%] rounded bg-ink/[.09]" />
            </div>

            {/* checkmark badge, front layer */}
            <div className="liquid-glass absolute left-0.5 top-0 flex h-[68px] w-[68px] -rotate-6 items-center justify-center rounded-[19px] shadow-[0_11px_22px_rgba(21,22,27,.14)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7"
                  stroke="#1F9D78"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="font-display text-[60px] font-extrabold leading-[.9] tracking-[-.05em] text-primary sm:text-[76px]">
            0%
          </div>
          <div className="mt-3 font-display text-base font-semibold">Platform fee.</div>
          <div className="mt-1 text-sm text-muted">Always. Forever.</div>

          <div className="relative my-6 h-px bg-ink/[.08]">
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/25" />
          </div>

          <div className="flex flex-col text-left">
            {PERKS.map((p, i) => (
              <div
                key={p}
                className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-ink/[.06]" : ""}`}
              >
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[9px] bg-white shadow-[0_2px_6px_rgba(21,22,27,.08)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="#1F9D78"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[14px]">{p}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-btn py-3.5 font-display text-[15px] font-semibold text-white transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[.98]"
            style={{ background: "linear-gradient(90deg, #1B1B3A 0%, #263A57 50%, #1F9D78 100%)" }}
          >
            Get started
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </Reveal>
      </section>

      {/* closing CTA */}
      <section className="px-5 py-14 sm:px-14">
        <Reveal className="relative mx-auto max-w-[1240px] overflow-hidden rounded-card p-10 text-center sm:p-16">
          {/* rich layered gradient — diagonal base + two soft glows, no flat fill */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #38316F 0%, #2F2A6B 45%, #1D1948 78%, #15161B 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-[10%] -top-[35%] h-[420px] w-[420px] rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(168,85,247,.35), transparent)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-[40%] -right-[8%] h-[460px] w-[460px] rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(0,190,255,.22), transparent)" }}
          />

          <div className="relative">
            <h2 className="font-display text-[30px] font-extrabold tracking-[-.03em] text-white sm:text-[42px]">
              Start getting paid in minutes
            </h2>
            <p className="mt-3.5 text-[17px] text-white/70">
              Create a product, share the link, watch it land.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-block rounded-btn bg-white px-9 py-4 font-display text-base font-semibold text-primary shadow-[0_10px_30px_rgba(0,0,0,.35)] transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[.97]"
            >
              Get started
            </Link>
          </div>
        </Reveal>
      </section>

      {/* footer */}
      <footer className="border-t border-ink/[.06] px-5 py-10 sm:px-14">
        <Wordmark size={22} />
        <div className="mt-3 max-w-[260px] text-sm leading-[1.55] text-muted">
          Checkout that feels like paying with cash.
        </div>
        <div className="mt-5 flex gap-6 text-[13px] text-muted">
          <span>Product</span>
          <span>Company</span>
          <span>Legal</span>
        </div>
      </footer>
    </div>
  );
}


function ValueBlock({
  title,
  body,
  reverse,
  hideBodyOnMobile,
  children,
}: {
  title: string;
  body: string;
  reverse?: boolean;
  hideBodyOnMobile?: boolean;
  children: React.ReactNode;
}) {
  const copy = (
    <div>
      <div className="font-display text-[26px] font-bold leading-[1.15] tracking-[-.02em] sm:text-[32px]">
        {title}
      </div>
      <div className={`mt-3.5 max-w-[440px] text-base leading-[1.6] text-muted ${hideBodyOnMobile ? "hidden sm:block" : ""}`}>
        {body}
      </div>
    </div>
  );
  const visual = (
    <div className="flex min-h-[240px] items-center justify-center rounded-[20px] border border-ink/[.06] bg-paper p-6">
      {children}
    </div>
  );
  return (
    <div className="grid items-center gap-12 rounded-[28px] border border-ink/[.08] bg-white p-8 sm:p-12 lg:grid-cols-2">
      {reverse ? (
        <>
          {visual}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {visual}
        </>
      )}
    </div>
  );
}

function PickRow({
  code,
  name,
  approx,
  selected,
}: {
  code: string;
  name: string;
  approx?: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-btn bg-white px-4 py-3 ${
        selected
          ? "border-[1.5px] border-primary"
          : "border border-ink/[.08] opacity-70"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="overflow-hidden rounded-[9px] shadow-[0_1px_4px_rgba(0,0,0,.12)]">
          <PaymentIcon code={code} size={30} radius={9} />
        </div>
        <span className="font-display text-[15px] font-semibold">{name}</span>
      </div>
      {selected ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#2F2A6B" />
          <path
            d="M7 12.5l3.2 3.2L17 8.5"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span className="text-[13px] text-muted">{approx}</span>
      )}
    </div>
  );
}
