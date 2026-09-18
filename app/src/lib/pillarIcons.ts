import {
  Crosshair,
  Grip,
  Hand,
  Footprints,
  Scale,
  Dumbbell,
  Rocket,
  Timer,
  Blocks,
  type LucideIcon,
} from "lucide-react";

export const PILLAR_ICONS: Record<string, LucideIcon> = {
  presa: Crosshair,
  mordida: Grip,
  control: Hand,
  seguimiento: Footprints,
  propiocepcion: Scale,
  fuerza: Dumbbell,
  pliometria: Rocket,
  resistencia: Timer,
  obstaculos: Blocks,
};
