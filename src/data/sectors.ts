import {
  Landmark, Cpu, CircuitBoard, Fuel, ShoppingBasket, HeartPulse, Zap, Tv,
  Truck, Boxes, Mountain, FlaskConical, Store, Factory, Radio, Wrench,
  Briefcase, Building2, Package, type LucideIcon,
} from 'lucide-react';

// TradingView groups every NSE stock under one of these sector labels. We map
// each to an icon + accent colour so the Sectors / Sector-detail views read like
// a proper terminal rather than a wall of grey text.
interface SectorMeta {
  icon: LucideIcon;
  color: string;
}

export const SECTOR_META: Record<string, SectorMeta> = {
  'Finance': { icon: Landmark, color: '#10B981' },
  'Technology Services': { icon: Cpu, color: '#06B6D4' },
  'Electronic Technology': { icon: CircuitBoard, color: '#8B5CF6' },
  'Energy Minerals': { icon: Fuel, color: '#F59E0B' },
  'Consumer Non-Durables': { icon: ShoppingBasket, color: '#EC4899' },
  'Health Technology': { icon: HeartPulse, color: '#EF4444' },
  'Health Services': { icon: HeartPulse, color: '#F87171' },
  'Utilities': { icon: Zap, color: '#EAB308' },
  'Consumer Durables': { icon: Tv, color: '#F97316' },
  'Consumer Services': { icon: Building2, color: '#FB7185' },
  'Transportation': { icon: Truck, color: '#0EA5E9' },
  'Distribution Services': { icon: Boxes, color: '#A855F7' },
  'Non-Energy Minerals': { icon: Mountain, color: '#D97706' },
  'Process Industries': { icon: FlaskConical, color: '#14B8A6' },
  'Retail Trade': { icon: Store, color: '#F472B6' },
  'Producer Manufacturing': { icon: Factory, color: '#64748B' },
  'Communications': { icon: Radio, color: '#3B82F6' },
  'Industrial Services': { icon: Wrench, color: '#94A3B8' },
  'Commercial Services': { icon: Briefcase, color: '#22D3EE' },
  'Miscellaneous': { icon: Package, color: '#9CA3AF' },
};

const FALLBACK: SectorMeta = { icon: Package, color: '#9CA3AF' };

export function getSectorMeta(name: string | null | undefined): SectorMeta {
  return (name && SECTOR_META[name]) || FALLBACK;
}
