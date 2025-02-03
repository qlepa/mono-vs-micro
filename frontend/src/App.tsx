import { useState } from "react";
import OrderForm from "./OrderForm";
import ArchitectureColumn from "./components/ArchitectureColumn";
import ArchitectureInfo from "./components/ArchitectureInfo";
import { Order, ArchitectureMetrics } from "../../shared/types";

function App() {
  const [orders, setOrders] = useState<{
    monolith: Order[];
    microservices: Order[];
  }>({
    monolith: [],
    microservices: [],
  });

  const [metrics, setMetrics] = useState<{
    monolith: ArchitectureMetrics;
    microservices: ArchitectureMetrics;
  }>({
    monolith: {
      responseTime: 0,
      maxResponseTime: 0,
      avgResponseTime: 0,
      status: "idle",
    },
    microservices: {
      responseTime: 0,
      maxResponseTime: 0,
      avgResponseTime: 0,
      status: "idle",
    },
  });

  const placeOrder = async (concurrentRequests: number) => {
    setMetrics({
      monolith: { ...metrics.monolith, status: "loading" },
      microservices: { ...metrics.microservices, status: "loading" },
    });

    try {
      const measureRequest = async (url: string) => {
        const startTime = performance.now();
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
        const endTime = performance.now();
        return {
          response,
          time: endTime - startTime,
        };
      };

      const monolithResults = await Promise.all(
        Array(concurrentRequests)
          .fill(null)
          .map(() => measureRequest("http://localhost:5000/monolith/order"))
      );

      const microservicesResults = await Promise.all(
        Array(concurrentRequests)
          .fill(null)
          .map(() =>
            measureRequest("http://localhost:5000/microservices/order")
          )
      );

      const calculateStats = (results: { time: number }[]) => {
        const times = results.map((r) => r.time);
        return {
          max: Math.max(...times),
          avg: times.reduce((a, b) => a + b, 0) / times.length,
        };
      };

      const monolithStats = calculateStats(monolithResults);
      const microservicesStats = calculateStats(microservicesResults);

      setOrders({
        monolith: monolithResults.map((result) => result.response),
        microservices: microservicesResults.map((result) => result.response),
      });

      setMetrics({
        monolith: {
          responseTime: monolithResults[monolithResults.length - 1].time,
          maxResponseTime: monolithStats.max,
          avgResponseTime: monolithStats.avg,
          status: "success",
        },
        microservices: {
          responseTime:
            microservicesResults[microservicesResults.length - 1].time,
          maxResponseTime: microservicesStats.max,
          avgResponseTime: microservicesStats.avg,
          status: "success",
        },
      });
    } catch (err) {
      console.error("Błąd podczas przetwarzania zamówienia:", err);
      setMetrics({
        monolith: {
          ...metrics.monolith,
          status: "error",
          error: "Wystąpił błąd podczas przetwarzania zamówienia",
        },
        microservices: {
          ...metrics.microservices,
          status: "error",
          error: "Wystąpił błąd podczas przetwarzania zamówienia",
        },
      });
    }
  };

  return (
    <div className="container">
      <h1>🍽️ Restauracja IT: Porównanie Monolit vs Mikroserwisy</h1>
      <div className="app-description">
        <div className="architecture-explanation">
          <h3>🏰 Monolit</h3>
          <p>
            👤 Jeden właściciel robi wszystko (zamówienia, gotowanie, płatności,
            wydawanie)
          </p>
          <div className="architecture-points">
            <p className="point">⚠️ Awaria zatrzymuje całą restaurację</p>
            <p className="point">
              ⏳ Przy dużej liczbie równoczesnych zamówień czas przetwarzania
              może wzrosnąć
            </p>
          </div>
        </div>

        <div className="architecture-explanation">
          <h3>🏢 Mikroserwisy</h3>
          <p>
            👥 Różni pracownicy zajmują się osobnymi zadaniami (kelner, kucharz,
            kasjer)
          </p>
          <div className="architecture-points">
            <p className="point">
              ✅ Awaria jednego nie blokuje reszty. Np. problem z płatnościami
              nie blokuje innych pracowników przed kolejnymi etapami.
            </p>
            <p className="point">
              ⚡ Lepiej radzi sobie z równoczesnym przetwarzaniem wielu zamówień
            </p>
          </div>
        </div>
      </div>
      <OrderForm placeOrder={placeOrder} />
      <div className="architectures-comparison">
        <ArchitectureColumn
          title="Monolit"
          metrics={metrics.monolith}
          orders={orders.monolith}
        />
        <ArchitectureColumn
          title="Mikroserwisy"
          metrics={metrics.microservices}
          orders={orders.microservices}
        />
      </div>
      <ArchitectureInfo />
    </div>
  );
}

export default App;
