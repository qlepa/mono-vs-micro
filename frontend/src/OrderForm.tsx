import React, { useState } from "react";
import "./components/OrderForm.css";

type OrderFormProps = {
  placeOrder: (concurrentRequests: number) => void;
};

function OrderForm({ placeOrder }: OrderFormProps) {
  const [concurrentRequests, setConcurrentRequests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder(concurrentRequests);
  };

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <div className="concurrent-requests">
        <label>
          Liczba jednoczesnych zamówień:
          <input
            type="number"
            min="1"
            max="5"
            value={concurrentRequests}
            onChange={(e) => setConcurrentRequests(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="submit" className="submit-button">
        Złóż zamówienia
      </button>
    </form>
  );
}

export default OrderForm;
