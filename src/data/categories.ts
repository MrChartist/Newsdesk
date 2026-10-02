import { Newspaper, TrendingUp, Building2, Globe, IndianRupee, Landmark, Bitcoin, Wheat, Briefcase, Heart, Cpu, Shield, Factory, Users, Swords, Target, Flag, Bomb, Radio } from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  icon: typeof Newspaper;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Category[] = [
  // ── Core Financial ──
  { id: 'Markets', label: 'Markets', icon: TrendingUp, color: '#32ADE6', bgColor: 'rgba(6, 182, 212, 0.15)' },
  { id: 'Stocks', label: 'Stocks', icon: TrendingUp, color: '#AF52DE', bgColor: 'rgba(139, 92, 246, 0.15)' },
  { id: 'Corporate', label: 'Corporate', icon: Building2, color: '#FF9F0A', bgColor: 'rgba(245, 158, 11, 0.15)' },
  { id: 'Business', label: 'Business', icon: Briefcase, color: '#FF375F', bgColor: 'rgba(236, 72, 153, 0.15)' },
  { id: 'Economy', label: 'Economy', icon: Landmark, color: '#30D158', bgColor: 'rgba(16, 185, 129, 0.15)' },

  // ── Geopolitics / Iran / Defense / Middle East ──
  { id: 'Geopolitics', label: 'Geopolitics', icon: Globe, color: '#FF453A', bgColor: 'rgba(229, 57, 53, 0.15)' },
  { id: 'MiddleEast', label: 'Middle East', icon: Target, color: '#FF9500', bgColor: 'rgba(255, 111, 0, 0.15)' },
  { id: 'Defense', label: 'Defense', icon: Shield, color: '#5E5CE6', bgColor: 'rgba(27, 63, 94, 0.15)' },

  // ── World / Global ──
  { id: 'World', label: 'World', icon: Globe, color: '#FF9500', bgColor: 'rgba(249, 115, 22, 0.15)' },
  { id: 'Global', label: 'Global', icon: Globe, color: '#FF6B35', bgColor: 'rgba(255, 107, 53, 0.15)' },

  // ── Finance Detail ──
  { id: 'Money', label: 'Money', icon: IndianRupee, color: '#00C7BE', bgColor: 'rgba(20, 184, 166, 0.15)' },
  { id: 'IPO', label: 'IPO', icon: TrendingUp, color: '#BF5AF2', bgColor: 'rgba(168, 85, 247, 0.15)' },
  { id: 'Crypto', label: 'Crypto', icon: Bitcoin, color: '#FF9F0A', bgColor: 'rgba(245, 158, 11, 0.15)' },
  { id: 'Commodities', label: 'Commodities', icon: Wheat, color: '#FFB340', bgColor: 'rgba(217, 119, 6, 0.15)' },
  { id: 'Forex', label: 'Forex', icon: Landmark, color: '#0A84FF', bgColor: 'rgba(14, 165, 233, 0.15)' },

  // ── Other ──
  { id: 'Tech', label: 'Tech', icon: Cpu, color: '#32ADE6', bgColor: 'rgba(6, 182, 212, 0.15)' },
  { id: 'AI', label: 'AI Intel', icon: Cpu, color: '#30D158', bgColor: 'rgba(16, 185, 129, 0.15)' },
  { id: 'Health', label: 'Health', icon: Heart, color: '#FF453A', bgColor: 'rgba(239, 68, 68, 0.15)' },
  { id: 'CFO', label: 'CFO Intel', icon: Shield, color: '#40C8E0', bgColor: 'rgba(15, 118, 110, 0.15)' },
  { id: 'Headlines', label: 'Headlines', icon: Newspaper, color: '#8E8E93', bgColor: 'rgba(100, 116, 139, 0.15)' },
  { id: 'General', label: 'General', icon: Newspaper, color: '#AEAEB2', bgColor: 'rgba(148, 163, 184, 0.15)' },
];

export function getCategoryMeta(categoryId: string): Category {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
}
