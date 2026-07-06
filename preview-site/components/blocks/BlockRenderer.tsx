"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeroParticleCanvas } from "@/components/ui/HeroParticleCanvas";

export type Block = {
  id?: string;
  blockType: string;
  // Hero
  eyebrow?: string | null;
  headline?: string;
  subhead?: string | null;
  image?: unknown;
  primaryCta?: { label?: string | null; href?: string | null };
  secondaryCta?: { label?: string | null; href?: string | null };
  // TextSection
  heading?: string | null;
  body?: string;
  alignment?: string;
  // ImageWithText
  imagePosition?: string;
  // CallToAction
  buttonLabel?: string;
  buttonHref?: string;
};

function HeroBlock({ block, index }: { block: Block; index: number }) {
  return (
    <section className="relative hero-grad min-h-[90vh] flex items-center px-4 sm:px-8 pt-16 overflow-hidden">
      <HeroParticleCanvas />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-cream/70 via-cream/30 to-transparent dark:from-stone-950/80 dark:via-stone-950/40 dark:to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 animate-fade-in">
            {block.eyebrow ? (
              <Badge variant="sage" className="mb-6"><span data-cs-field={`pages:blocks.${index}.eyebrow`}>{block.eyebrow}</span></Badge>
            ) : null}
            {block.headline ? (
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-semibold text-stone-800 dark:text-stone-100 leading-[0.95] tracking-tight" data-cs-field={`pages:blocks.${index}.headline`}>
                {block.headline}
              </h1>
            ) : null}
            {block.subhead ? (
              <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-300 mt-6 max-w-lg font-serif leading-relaxed" data-cs-field={`pages:blocks.${index}.subhead`}>
                {block.subhead}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-4 mt-8">
              {block.primaryCta?.label ? (
                <Button variant="primary" size="lg" onClick={() => {
                  if (block.primaryCta?.href) window.location.href = block.primaryCta.href;
                }}>
                  {block.primaryCta.label}
                </Button>
              ) : null}
              {block.secondaryCta?.label ? (
                <Button variant="secondary" size="lg" onClick={() => {
                  if (block.secondaryCta?.href) window.location.href = block.secondaryCta.href;
                }}>
                  {block.secondaryCta.label}
                </Button>
              ) : null}
            </div>
          </div>
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {block.image ? (
              <div className="rounded-xl2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={typeof block.image === "object" && "url" in (block.image as Record<string, unknown>) ? (block.image as Record<string, string>).url : "/images/placeholder.svg"}
                  alt=""
                  className="w-full"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function TextSectionBlock({ block, index }: { block: Block; index: number }) {
  return (
    <section className="px-4 sm:px-8 py-24 sm:py-32">
      <div className={`max-w-3xl mx-auto ${block.alignment === "center" ? "text-center" : ""}`}>
        {block.heading ? (
          <h2 className="text-4xl sm:text-5xl font-display font-semibold text-stone-800 dark:text-stone-100 leading-[1.05] mb-6" data-cs-field={`pages:blocks.${index}.heading`}>
            {block.heading}
          </h2>
        ) : null}
        {block.body ? (
          <p className="text-lg text-stone-500 dark:text-stone-300 font-serif leading-relaxed" data-cs-field={`pages:blocks.${index}.body`}>
            {block.body}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ImageWithTextBlock({ block, index }: { block: Block; index: number }) {
  const isReverse = block.imagePosition === "right";

  return (
    <section className="px-4 sm:px-8 py-24 sm:py-32">
      <div className={`max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center ${isReverse ? "" : ""}`}>
        <div className={isReverse ? "order-2" : ""}>
          {block.heading ? (
            <h2 className="text-4xl sm:text-5xl font-display font-semibold text-stone-800 dark:text-stone-100 leading-[1.05] mb-6" data-cs-field={`pages:blocks.${index}.heading`}>
              {block.heading}
            </h2>
          ) : null}
          {block.body ? (
            <p className="text-lg text-stone-500 dark:text-stone-300 font-serif leading-relaxed" data-cs-field={`pages:blocks.${index}.body`}>
              {block.body}
            </p>
          ) : null}
        </div>
        <div className={isReverse ? "order-1" : ""}>
          {block.image ? (
            <div className="rounded-xl2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={typeof block.image === "object" && "url" in (block.image as Record<string, unknown>) ? (block.image as Record<string, string>).url : ""}
                alt=""
                className="w-full"
              />
            </div>
          ) : (
            <div className="rounded-xl2 bg-primary-100 dark:bg-primary-900/30 h-64 flex items-center justify-center text-stone-400 text-sm">
              No image selected
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CallToActionBlock({ block, index }: { block: Block; index: number }) {
  return (
    <section className="px-4 sm:px-8 py-24 sm:py-32 bg-primary-50/40 dark:bg-primary-950/20 noise-bg">
      <div className="max-w-3xl mx-auto text-center">
        {block.heading ? (
          <h2 className="text-4xl sm:text-5xl font-display font-semibold text-stone-800 dark:text-stone-100 leading-[1.05] mb-4" data-cs-field={`pages:blocks.${index}.heading`}>
            {block.heading}
          </h2>
        ) : null}
        {block.body ? (
          <p className="text-lg text-stone-500 dark:text-stone-300 font-serif leading-relaxed max-w-md mx-auto mb-8" data-cs-field={`pages:blocks.${index}.body`}>
            {block.body}
          </p>
        ) : null}
        {block.buttonLabel ? (
          <Button variant="primary" size="lg" onClick={() => {
            if (block.buttonHref) window.location.href = block.buttonHref;
          }}>
            <span data-cs-field={`pages:blocks.${index}.buttonLabel`}>{block.buttonLabel}</span>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function BlockRenderer({ block, index }: { block: Block; index: number }) {
  switch (block.blockType) {
    case "hero":
      return <HeroBlock block={block} index={index} />;
    case "textSection":
      return <TextSectionBlock block={block} index={index} />;
    case "imageWithText":
      return <ImageWithTextBlock block={block} index={index} />;
    case "callToAction":
      return <CallToActionBlock block={block} index={index} />;
    default:
      return null;
  }
}

export function RenderBlocks({ blocks }: { blocks: Block[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <BlockRenderer key={(block as { id?: string }).id || i} block={block} index={i} />
      ))}
    </>
  );
}
