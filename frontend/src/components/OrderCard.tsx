import { Order, OrderStage, OrderStatus } from "../../../shared/types";
import { memo } from "react";
import "./OrderCard.css";

const STAGE_NAMES: Record<OrderStage["name"], string> = {
  order: "Przyjęcie",
  preparation: "Przygotowanie",
  delivery: "Dostawa",
};

const STATUS_NAMES: Record<OrderStatus, string> = {
  pending: "Oczekuje",
  in_progress: "W trakcie",
  completed: "Zakończone",
  failed: "Błąd",
};

interface OrderCardProps {
  order: Order;
}

const OrderCard = memo(({ order }: OrderCardProps) => {
  if (!order || !order.stages) {
    return (
      <div className="order-card error">Nieprawidłowe dane zamówienia</div>
    );
  }

  const getStageTime = (stage: OrderStage): string | null => {
    if (stage.startTime && stage.endTime) {
      return `${(stage.endTime - stage.startTime).toFixed(0)}ms`;
    }
    return null;
  };

  return (
    <div className="order-card">
      <h4>Zamówienie #{order.id}</h4>
      <div className="stages">
        {order.stages.map((stage: OrderStage) => {
          const stageTime = getStageTime(stage);

          return (
            <div
              key={stage.name}
              className={`stage ${stage.status} ${
                stage.failureReason ? "has-error" : ""
              }`}
            >
              <span className="stage-name">{STAGE_NAMES[stage.name]}</span>
              <span className="stage-status">{STATUS_NAMES[stage.status]}</span>
              {stageTime && <span className="stage-time">{stageTime}</span>}
            </div>
          );
        })}
      </div>
      {order.totalTime && (
        <div className="total-time">
          Całkowity czas: {order.totalTime.toFixed(0)}ms
        </div>
      )}
    </div>
  );
});

OrderCard.displayName = "OrderCard";

export default OrderCard;
