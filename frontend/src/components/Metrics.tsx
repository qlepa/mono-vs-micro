import { ArchitectureMetrics } from "../../../shared/types";
import "./Metrics.css";

interface MetricsProps {
  metrics: ArchitectureMetrics;
}

const Metrics = ({ metrics }: MetricsProps) => {
  return (
    <div className="metrics">
      <p>Ostatni czas odpowiedzi: {metrics.responseTime.toFixed(2)} ms</p>
      <p>Maksymalny czas: {metrics.maxResponseTime.toFixed(2)} ms</p>
      <p>Średni czas: {metrics.avgResponseTime.toFixed(2)} ms</p>
      <p>
        Status:{" "}
        <span className={metrics.status === "loading" ? "loading-status" : ""}>
          {metrics.status}
        </span>
      </p>
      {metrics.error && <p className="error">{metrics.error}</p>}
    </div>
  );
};

export default Metrics;
