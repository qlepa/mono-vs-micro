import express from 'express';
import cors from 'cors';
import { Order, OrderStage } from '../../../../shared/types';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5002;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const PREPARATION_TIME = 1000;
const MAX_CONCURRENT_PREPARATIONS = 5;
let currentPreparations = 0;

const preparationQueue: { resolve: Function, order: Order }[] = [];

const processNextInQueue = async () => {
  if (preparationQueue.length === 0 || currentPreparations >= MAX_CONCURRENT_PREPARATIONS) {
    return;
  }

  const { resolve, order } = preparationQueue.shift()!;
  currentPreparations++;

  const startTime = Date.now();
  await wait(PREPARATION_TIME);
  const endTime = Date.now();

  currentPreparations--;

  const preparationStage: OrderStage = {
    name: 'preparation',
    status: 'completed',
    startTime,
    endTime
  };

  const updatedOrder: Order = {
    ...order,
    stages: [...order.stages, preparationStage],
    totalTime: order.stages && 
      order.stages.length > 0 && 
      order.stages[0].startTime !== undefined ? 
      endTime - order.stages[0].startTime : 
      0
  };

  resolve(updatedOrder);
  processNextInQueue();
};

app.post('/prepare', async (req, res) => {
  try {
    const { order } = req.body;
    
    if (!order || !Array.isArray(order.stages)) {
      throw new Error('Invalid order format');
    }

    if (currentPreparations < MAX_CONCURRENT_PREPARATIONS) {
      currentPreparations++;
      
      const startTime = Date.now();
      await wait(PREPARATION_TIME);
      const endTime = Date.now();
      
      currentPreparations--;

      const preparationStage: OrderStage = {
        name: 'preparation',
        status: 'completed',
        startTime,
        endTime
      };

      const firstStageStartTime = order.stages[0]?.startTime ?? startTime;

      const updatedOrder: Order = {
        ...order,
        stages: [...order.stages, preparationStage],
        totalTime: endTime - firstStageStartTime
      };

      res.json(updatedOrder);
    } else {
      const promise = new Promise((resolve) => {
        preparationQueue.push({ resolve, order });
      });

      processNextInQueue();
      const updatedOrder = await promise;
      res.json(updatedOrder);
    }
  } catch (error) {
    console.error('Error preparing order:', error);
    res.status(500).json({ error: 'Failed to prepare order' });
  }
});

app.listen(PORT, () => {
  console.log(`👨‍🍳 Preparation service running on port ${PORT} with ${MAX_CONCURRENT_PREPARATIONS} concurrent preparations`);
});
