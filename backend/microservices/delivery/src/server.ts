import express from 'express';
import cors from 'cors';
import { Order, OrderStage } from '../../../../shared/types';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5003;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DELIVERY_TIME = 800;
const MAX_CONCURRENT_DELIVERIES = 5;
let currentDeliveries = 0;

const deliveryQueue: { resolve: Function, order: Order }[] = [];

const processNextInQueue = async () => {
  if (deliveryQueue.length === 0 || currentDeliveries >= MAX_CONCURRENT_DELIVERIES) {
    return;
  }

  const { resolve, order } = deliveryQueue.shift()!;
  currentDeliveries++;

  const startTime = Date.now();
  await wait(DELIVERY_TIME);
  const endTime = Date.now();

  currentDeliveries--;

  const deliveryStage: OrderStage = {
    name: 'delivery',
    status: 'completed',
    startTime,
    endTime
  };

  const updatedOrder: Order = {
    ...order,
    stages: [...order.stages, deliveryStage],
    totalTime: order.stages && 
      order.stages.length > 0 && 
      order.stages[0].startTime !== undefined ? 
      endTime - order.stages[0].startTime : 
      0
  };

  resolve(updatedOrder);
  processNextInQueue();
};

app.post('/deliver', async (req, res) => {
  try {
    const { order } = req.body;
    
    if (!order || !Array.isArray(order.stages)) {
      throw new Error('Invalid order format');
    }

    if (currentDeliveries < MAX_CONCURRENT_DELIVERIES) {
      currentDeliveries++;
      
      const startTime = Date.now();
      await wait(DELIVERY_TIME);
      const endTime = Date.now();
      
      currentDeliveries--;

      const deliveryStage: OrderStage = {
        name: 'delivery',
        status: 'completed',
        startTime,
        endTime
      };

      const firstStageStartTime = order.stages[0]?.startTime ?? startTime;

      const updatedOrder: Order = {
        ...order,
        stages: [...order.stages, deliveryStage],
        totalTime: endTime - firstStageStartTime
      };

      res.json(updatedOrder);
    } else {
      const promise = new Promise((resolve) => {
        deliveryQueue.push({ resolve, order });
      });

      processNextInQueue();
      const updatedOrder = await promise;
      res.json(updatedOrder);
    }
  } catch (error) {
    console.error('Error delivering order:', error);
    res.status(500).json({ error: 'Failed to deliver order' });
  }
});

app.listen(PORT, () => {
  console.log(`🛵 Delivery service running on port ${PORT} with ${MAX_CONCURRENT_DELIVERIES} concurrent deliveries`);
});
