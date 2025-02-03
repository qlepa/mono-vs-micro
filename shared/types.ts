export type KitchenFailure =
  | "PIZZA_OVEN_BROKEN"
  | "SUSHI_MASTER_SICK"
  | "NO_BURGER_BUNS"
  | null;

export type OrderStatus = "pending" | "in_progress" | "completed" | "failed";

export type OrderStage = {
  name: "order" | "preparation" | "delivery";
  status: OrderStatus;
  startTime?: number;
  endTime?: number;
  failureReason?: string;
};

export type Order = {
  id: string;
  stages: OrderStage[];
  totalTime?: number;
};

export type SystemType = "monolith" | "microservices";

export type ArchitectureMetrics = {
  responseTime: number;
  maxResponseTime: number;
  avgResponseTime: number;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}; 