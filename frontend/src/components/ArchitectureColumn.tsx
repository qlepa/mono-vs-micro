import { Order, ArchitectureMetrics } from "../../../shared/types";
import Metrics from "./Metrics";
import OrderCard from "./OrderCard";
import "./ArchitectureColumn.css";

interface ArchitectureColumnProps {
  title: string;
  metrics: ArchitectureMetrics;
  orders: Order[];
}

const ArchitectureColumn = ({
  title,
  metrics,
  orders,
}: ArchitectureColumnProps) => {
  return (
    <div className="architecture-column">
      <h2>{title}</h2>
      <Metrics metrics={metrics} />
      <div className="orders-list">
        {Array.isArray(orders) &&
          orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
};

export default ArchitectureColumn;
