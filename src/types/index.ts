// Define interfaces for API data
export interface DurationData {
  total_orders: number;
  avg_user_init_duration: number | null;
  avg_cobi_init_duration: number | null;
  avg_user_redeem_duration: number | null;
  avg_cobi_redeem_duration: number | null;
  avg_user_refund_duration: number | null;
  avg_cobi_refund_duration: number | null;
}

export interface Order {
  create_order_id: string;
  created_at: string;
  durations: {
    user_init_duration: number | null;
    cobi_init_duration: number | null;
    user_redeem_duration: number | null;
    cobi_redeem_duration: number | null;
    user_refund_duration: number | null;
    cobi_refund_duration: number | null;
    overall_duration: number | null;
  };
}

export interface ThresholdData {
  user_init_duration: { upper: number | null };
  cobi_init_duration: { upper: number | null };
  user_redeem_duration: { upper: number | null };
  cobi_redeem_duration: { upper: number | null };
}

export interface AveragesResponse {
  message: string;
  last_updated: string;
  averages: Record<string, DurationData>;
  thresholds?: Record<string, ThresholdData>;
}

export interface OrdersResponse {
  message: string;
  orders: Record<string, Order[]>;
  anomalies?: Record<string, ThresholdData>;
}