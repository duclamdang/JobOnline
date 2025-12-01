export interface PromotionPayload {
  name: string;
  code?: string | null;
  description?: string | null;
  price: number;
  points: number;
  start_at?: string | null;
  end_at?: string | null;
  is_active?: boolean;
}

export interface Promotion extends PromotionPayload {
  id: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
