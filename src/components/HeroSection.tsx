import HeroAsciiOne from '@/components/ui/hero-ascii-one';

export type HeroSectionProps = {
  onExploreSystems?: () => void;
};

export default function HeroSection(props: HeroSectionProps) {
  return <HeroAsciiOne {...props} />;
}
