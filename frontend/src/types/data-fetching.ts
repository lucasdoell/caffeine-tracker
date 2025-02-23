export type CaffeineLog = {
  id: string;
  user: string;
  beverage_name: string | null;
  serving_size: string;
  caffeine_mg: number;
  total_fat_g: number;
  sodium_mg: number;
  total_carbohydrates_g: number;
  sugars_g: number;
  added_sugars_g: number;
  protein_g: number;
  taurine_mg: number;
  calories_kcal: number;
  b_vitamins: BVitamins;
  other_ingredients: OtherIngredients;
  image_url: string | null;
  additional_notes: string | null;
  confirmed: boolean;
  created_at: string;
};

export type BVitamins = {
  vitamin_b3_mg: number;
  vitamin_b6_mg: number;
  vitamin_b12_mcg: number;
};

export type OtherIngredients = {
  carbonated_water: boolean;
  natural_flavors: boolean;
  sucralose: boolean;
};
