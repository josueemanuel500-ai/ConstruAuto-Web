import type { Page } from './pages';

export interface SectionProps {
  onNavigate: (page: Page) => void;
}
