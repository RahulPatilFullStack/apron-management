const TYPE_BADGE_CLASSES: Record<string, string> = {
  Arrival: 'badge-arrival',
  Departure: 'badge-departure',
  TowInMovement: 'badge-towin',
  TowOutMovement: 'badge-towout',
};

export function flightPlanTypeBadgeClass(flightPlanType: string): string {
  return TYPE_BADGE_CLASSES[flightPlanType] ?? 'badge-default';
}
