import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export function Hero() {
  return (
    <div className="min-h-[calc(92dvh-4rem)] md:min-h-[calc(92dvh-4.5rem)]">
      <Container>
        <div className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-display-2xl uppercase text-foreground">
              Design your own tee.
              <br />
              Wear the proof.
            </h1>
            <p className="max-w-md text-body-lg text-muted">
              Drop text, art, and photos onto a shirt right in your browser.
              We print it and ship it to your door.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/signup" variant="primary">
                Start designing
              </Button>
              <Button href="#how-it-works" variant="secondary">
                See how it works
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-accent/40">
            {/* Placeholder — swap for real brand/product photography before launch */}
            <Image
              src="https://picsum.photos/seed/stitch-streetwear-tee/900/1125"
              alt="Model wearing a custom-printed T-shirt designed on the platform"
              fill
              priority
              className="object-cover grayscale contrast-125"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
            <div className="absolute inset-0 bg-accent mix-blend-color opacity-30" />
          </div>
        </div>
      </Container>
    </div>
  );
}
