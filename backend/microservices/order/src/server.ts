import express, { RequestHandler } from 'express';
import cors from 'cors';
import { Order, OrderStage } from '../../../../shared/types';

const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json());

const PORT = 5001;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ORDER_PROCESSING_TIME = 200;

const shouldFail = () => Math.random() < 0.3;
const getRandomFailureReason = () => {
  const reasons = ['Problem z systemem zamówień', 'Przeciążenie systemu', 'Błąd walidacji'];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

const handleOrder: RequestHandler = async (req, res) => {
  try {
    const orderId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();
    
    const willFail = shouldFail();
    const failureReason = willFail ? getRandomFailureReason() : undefined;

    await wait(ORDER_PROCESSING_TIME);
    
    const endTime = Date.now();
    
    const orderStage: OrderStage = {
      name: 'order',
      status: willFail ? 'failed' : 'completed',
      startTime,
      endTime,
      failureReason
    };

    const order: Order = {
      id: orderId,
      stages: [orderStage],
      totalTime: endTime - startTime
    };

    if (willFail) {
      res.status(200).json({
        ...order,
        orderStatus: 'failed'
      });
      return;
    }

    res.status(200).json({
      ...order,
      orderStatus: 'completed'
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
};

router.post('/order', handleOrder);

app.use(router);

app.listen(PORT, () => {
  console.log(`💸Order service running on port ${PORT} with ${ORDER_PROCESSING_TIME}ms processing time`);
});
