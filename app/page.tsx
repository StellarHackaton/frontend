import Link from "next/link";
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
    icon: (
      <path d="M12 5v14M5 12h14" stroke="#2F2A6B" strokeWidth="2" strokeLinecap="round" />
    ),
    tint: "bg-primary-soft",
  },
  {
    title: "Share the link or QR",
    body: "Send it anywhere your buyers already are.",
    icon: (
      <path
        d="M9 15l6-6M10 6.5l1-1a4 4 0 0 1 6 6l-1 1M14 17.5l-1 1a4 4 0 0 1-6-6l1-1"
        stroke="#2F2A6B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    tint: "bg-primary-soft",
  },
  {
    title: "Get paid",
    body: "Buyers pay with any balance. You receive exact dollars.",
    icon: (
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="#1F9D78"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    tint: "bg-success/[.12]",
  },
];

const PERKS = [
  "Unlimited products and payment links",
  "Instant links and QR for every product",
  "Receipts and proof on every order",
  "Buyers pay with any balance they hold",
];

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
      <section id="product" className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-14 sm:px-14 lg:grid-cols-[1.05fr_.95fr] lg:py-[88px]">
        <Reveal>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/[.07] px-3.5 py-[7px] text-[13px] font-semibold text-primary">
            Checkout that feels like cash
          </div>
          <h1 className="font-display text-[40px] font-extrabold leading-[1.04] tracking-[-.035em] sm:text-[62px]">
            Get paid in any balance. Receive exact dollars.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-muted sm:text-[19px]">
            Lunas turns any balance your customer holds into the exact amount you
            asked for. One tap. No jargon.
          </p>
          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
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
        </Reveal>

        {/* hero phone */}
        <Reveal delay={0.1} className="flex justify-center">
          <PhoneHero />
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
        <div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.08}
              className="rounded-card border border-ink/[.08] bg-white p-8"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] ${s.tint}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {s.icon}
                </svg>
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
      <section className="border-t border-ink/[.06] bg-white px-5 py-16 sm:px-14 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-[30px] font-bold tracking-[-.025em] sm:text-[38px]">
            Honest pricing
          </h2>
          <p className="mt-3 text-[17px] text-muted">One plan. No surprises.</p>
        </div>
        <Reveal className="mx-auto max-w-[520px] rounded-card border border-ink/[.08] bg-paper p-12 text-center">
          <div className="font-display text-[84px] font-extrabold leading-[.9] tracking-[-.05em] text-primary sm:text-[104px]">
            0%
          </div>
          <div className="mt-2 text-base text-muted">platform fee</div>
          <div className="my-8 flex flex-col gap-3.5 text-left">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="#1F9D78"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-base">{p}</span>
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="liquid-surface block w-full rounded-btn py-4 text-center font-display text-base font-semibold text-white"
          >
            Get started
          </Link>
        </Reveal>
      </section>

      {/* closing CTA */}
      <section className="px-5 py-14 sm:px-14">
        <Reveal className="mx-auto max-w-[1240px] rounded-card bg-primary p-10 text-center sm:p-16">
          <h2 className="font-display text-[30px] font-extrabold tracking-[-.03em] text-white sm:text-[42px]">
            Start getting paid in minutes
          </h2>
          <p className="mt-3.5 text-[17px] text-white/70">
            Create a product, share the link, watch it land.
          </p>
          <Link
            href="/login"
            className="liquid-glass !border-white/30 mt-7 inline-block rounded-btn px-8 py-4 text-center font-display text-base font-semibold text-white"
          >
            Get started
          </Link>
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
  children,
}: {
  title: string;
  body: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  const copy = (
    <div>
      <div className="font-display text-[26px] font-bold leading-[1.15] tracking-[-.02em] sm:text-[32px]">
        {title}
      </div>
      <div className="mt-3.5 max-w-[440px] text-base leading-[1.6] text-muted">
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
