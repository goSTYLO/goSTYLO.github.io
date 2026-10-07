import HeroAsciiOne from '@/components/sections/hero/hero-ascii-one';

export type HeroSectionProps = {
  onExploreSystems?: () => void;
  onOpenCv?: () => void;
  cvOpen?: boolean;
};

export default function HeroSection(props: HeroSectionProps) {
  return <HeroAsciiOne {...props} />;
}
