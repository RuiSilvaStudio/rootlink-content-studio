import type { Media, Template } from '@/payload-types'

type TemplateBlocks = NonNullable<Template['blocks']>
type AnyBlock = TemplateBlocks[number]

function mediaUrl(image: AnyBlock extends { image?: infer I } ? I : never): string | undefined {
  if (image && typeof image === 'object' && 'url' in image) {
    return (image as Media).url ?? undefined
  }
  return undefined
}

function mediaAlt(image: unknown): string {
  if (image && typeof image === 'object' && 'alt' in image) {
    return (image as Media).alt || ''
  }
  return ''
}

function HeroBlock({ block }: { block: Extract<AnyBlock, { blockType: 'hero' }> }) {
  const imageUrl = mediaUrl(block.image as never)
  return (
    <section className="cs-section cs-hero">
      {block.eyebrow ? <p className="cs-small cs-hero__eyebrow">{block.eyebrow}</p> : null}
      <h1 className="cs-h1">{block.headline}</h1>
      {block.subhead ? <p className="cs-body">{block.subhead}</p> : null}
      <div className="cs-hero__ctas">
        {block.primaryCta?.label ? (
          <a className="cs-button cs-button--primary" href={block.primaryCta.href || '#'}>
            {block.primaryCta.label}
          </a>
        ) : null}
        {block.secondaryCta?.label ? (
          <a className="cs-button cs-button--secondary" href={block.secondaryCta.href || '#'}>
            {block.secondaryCta.label}
          </a>
        ) : null}
      </div>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cs-hero__image" src={imageUrl} alt={mediaAlt(block.image)} />
      ) : null}
    </section>
  )
}

function TextSectionBlock({ block }: { block: Extract<AnyBlock, { blockType: 'textSection' }> }) {
  return (
    <section
      className={`cs-section cs-text-section ${block.alignment === 'center' ? 'cs-text-section--center' : ''}`}
    >
      {block.heading ? <h2 className="cs-h2">{block.heading}</h2> : null}
      <p className="cs-body">{block.body}</p>
    </section>
  )
}

function ImageWithTextBlock({ block }: { block: Extract<AnyBlock, { blockType: 'imageWithText' }> }) {
  const imageUrl = mediaUrl(block.image as never)
  return (
    <section
      className={`cs-section cs-image-with-text ${block.imagePosition === 'right' ? 'cs-image-with-text--reverse' : ''}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cs-image-with-text__image" src={imageUrl} alt={mediaAlt(block.image)} />
      ) : (
        <div className="cs-empty cs-image-with-text__image">No image selected</div>
      )}
      <div className="cs-image-with-text__body">
        {block.heading ? <h2 className="cs-h2">{block.heading}</h2> : null}
        <p className="cs-body">{block.body}</p>
      </div>
    </section>
  )
}

function CallToActionBlock({ block }: { block: Extract<AnyBlock, { blockType: 'callToAction' }> }) {
  return (
    <section className="cs-section cs-cta cs-surface-1">
      <h2 className="cs-h2">{block.heading}</h2>
      {block.body ? <p className="cs-body">{block.body}</p> : null}
      <a className="cs-button cs-button--primary" href={block.buttonHref || '#'}>
        {block.buttonLabel}
      </a>
    </section>
  )
}

export function BlockRenderer({ block }: { block: AnyBlock }) {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlock block={block} />
    case 'textSection':
      return <TextSectionBlock block={block} />
    case 'imageWithText':
      return <ImageWithTextBlock block={block} />
    case 'callToAction':
      return <CallToActionBlock block={block} />
    default:
      return null
  }
}

export function TemplateBlocksRenderer({ blocks }: { blocks: TemplateBlocks | null | undefined }) {
  if (!blocks || blocks.length === 0) {
    return <div className="cs-empty cs-section">This template has no blocks yet -- add one in the editor.</div>
  }

  return (
    <>
      {blocks.map((block, i) => (
        <BlockRenderer key={('id' in block && block.id) || i} block={block} />
      ))}
    </>
  )
}
