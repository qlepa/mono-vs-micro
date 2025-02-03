import express, { RequestHandler } from 'express';
import cors from 'cors';
import axios, { AxiosError } from 'axios';
import { Order, OrderStage } from '../../shared/types';

const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Proxy dla monolitu
const handleMonolithOrder: RequestHandler = async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5004/order', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error in monolith:', error);
    if (error instanceof AxiosError && error.response) {
      res.status(500).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Monolith service failed' });
    }
  }
};

// Koordynator mikrousług
const handleMicroservicesOrder: RequestHandler = async (req, res) => {
  try {
    let order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      stages: []
    };

    // Etap 1: Przyjęcie zamówienia
    try {
      const orderResponse = await axios.post('http://localhost:5001/order', req.body);
      order.stages.push(...orderResponse.data.stages);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.stages) {
        order.stages.push(...error.response.data.stages);
      } else {
        order.stages.push({
          name: 'order',
          status: 'failed',
          startTime: Date.now(),
          endTime: Date.now(),
          failureReason: 'Service unavailable'
        });
      }
    }

    // Etap 2: Przygotowanie
    try {
      const prepResponse = await axios.post('http://localhost:5002/prepare', { order });
      // Aktualizujemy tylko jeśli serwis odpowiedział poprawnie
      if (prepResponse.data.stages) {
        const existingStages = order.stages.filter((s: OrderStage) => s.name !== 'preparation');
        order.stages = [...existingStages, ...prepResponse.data.stages.filter((s: OrderStage) => s.name === 'preparation')];
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.stages) {
        const failedStages = error.response.data.stages.filter((s: OrderStage) => s.name === 'preparation');
        const existingStages = order.stages.filter((s: OrderStage) => s.name !== 'preparation');
        order.stages = [...existingStages, ...failedStages];
      } else {
        order.stages.push({
          name: 'preparation',
          status: 'failed',
          startTime: Date.now(),
          endTime: Date.now(),
          failureReason: 'Service unavailable'
        });
      }
    }

    // Etap 3: Dostawa
    try {
      const deliveryResponse = await axios.post('http://localhost:5003/deliver', { order });
      // Aktualizujemy tylko jeśli serwis odpowiedział poprawnie
      if (deliveryResponse.data.stages) {
        const existingStages = order.stages.filter((s: OrderStage) => s.name !== 'delivery');
        order.stages = [...existingStages, ...deliveryResponse.data.stages.filter((s: OrderStage) => s.name === 'delivery')];
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.stages) {
        const failedStages = error.response.data.stages.filter((s: OrderStage) => s.name === 'delivery');
        const existingStages = order.stages.filter((s: OrderStage) => s.name !== 'delivery');
        order.stages = [...existingStages, ...failedStages];
      } else {
        order.stages.push({
          name: 'delivery',
          status: 'failed',
          startTime: Date.now(),
          endTime: Date.now(),
          failureReason: 'Service unavailable'
        });
      }
    }

    // Obliczamy całkowity czas
    const startTime = Math.min(...order.stages.map((s: OrderStage) => s.startTime || Date.now()));
    const endTime = Math.max(...order.stages.map((s: OrderStage) => s.endTime || Date.now()));
    order.totalTime = endTime - startTime;

    // Zwracamy zawsze 200, ponieważ awaria jest przewidzianym scenariuszem biznesowym
    res.status(200).json({
      ...order,
      orderStatus: order.stages.some((stage: OrderStage) => stage.status === 'failed') ? 'failed' : 'completed'
    });
  } catch (error) {
    console.error('Error in microservices:', error);
    // Tu zachowujemy 500, ponieważ to rzeczywisty błąd techniczny
    res.status(500).json({ error: 'Microservices chain failed unexpectedly' });
  }
};

router.post('/monolith/order', handleMonolithOrder);
router.post('/microservices/order', handleMicroservicesOrder);

app.use(router);

app.listen(PORT, () => {
  console.log(`🌌 Main server running on port ${PORT}`);
}); 