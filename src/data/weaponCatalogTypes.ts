export type WeaponDefinition = {
  id: string;
  name: string;
  damage?: string;
  damageType?: "Bludgeoning" | "Piercing" | "Slashing";
  properties: string;
  versatileDamage?: string;
  mastery?: "Cleave" | "Graze" | "Nick" | "Push" | "Sap" | "Slow" | "Topple" | "Vex";
  icon?: string;
  note?: string;
};