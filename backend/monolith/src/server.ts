import cors from 'cors';
import express, { RequestHandler, Router } from 'express';
import { Order, OrderStage } from '../../../shared/types';

const app = express();
const router = Router();
app.use(cors());
app.use(express.json());

const PORT = 5004;

const CONFIG = {
  maxConcurrentOrders: 10,
  maxConcurrentPreparations: 3,
  maxConcurrentDeliveries: 2,
  orderTimeout: 5000,
  preparationTimeout: 8000,
  deliveryTimeout: 6000
};

const systemState = {
  activeOrders: 0,
  activePreparations: 0,
  activeDeliveries: 0,
  isKitchenOperational: true,
  isDeliveryOperational: true
};

const wait = (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, ms));

const checkComponentAvailability = (
  component: 'order' | 'preparation' | 'delivery'
): { isAvailable: boolean; reason?: string } => {
  switch (component) {
    case 'order':
      if (systemState.activeOrders >= CONFIG.maxConcurrentOrders) {
        return { isAvailable: false, reason: 'System przeciążony - zbyt wiele aktywnych zamówień' };
      }
      break;
    case 'preparation':
      if (!systemState.isKitchenOperational) {
        return { isAvailable: false, reason: 'Kuchnia chwilowo niedostępna' };
      }
      if (systemState.activePreparations >= CONFIG.maxConcurrentPreparations) {
        return { isAvailable: false, reason: 'Kuchnia przeciążona' };
      }
      break;
    case 'delivery':
      if (!systemState.isDeliveryOperational) {
        return { isAvailable: false, reason: 'System dostaw chwilowo niedostępny' };
      }
      if (systemState.activeDeliveries >= CONFIG.maxConcurrentDeliveries) {
        return { isAvailable: false, reason: 'Brak dostępnych dostawców' };
      }
      break;
  }
  return { isAvailable: true };
};

const executeWithTimeout = async (
  operation: () => Promise<void>,
  timeout: number,
  errorMessage: string
): Promise<void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  try {
    await Promise.race([
      operation(),
      new Promise<void>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeout);
      })
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const handleOrder: RequestHandler = async (req, res) => {
  const stages: OrderStage[] = [];
  const orderId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  try {
    const orderStartTime = startTime;
    const orderAvailability = checkComponentAvailability('order');
    
    if (!orderAvailability.isAvailable) {
      stages.push({
        name: 'order',
        status: 'failed',
        startTime: orderStartTime,
        endTime: Date.now(),
        failureReason: orderAvailability.reason
      });
      throw new Error(orderAvailability.reason);
    }

    systemState.activeOrders++;
    await executeWithTimeout(
      async (): Promise<void> => { await wait(200); },
      CONFIG.orderTimeout,
      'Timeout podczas przetwarzania zamówienia'
    );
    
    stages.push({
      name: 'order',
      status: 'completed',
      startTime: orderStartTime,
      endTime: Date.now()
    });

    const prepStartTime = Date.now();
    const prepAvailability = checkComponentAvailability('preparation');
    
    if (!prepAvailability.isAvailable) {
      stages.push({
        name: 'preparation',
        status: 'failed',
        startTime: prepStartTime,
        endTime: Date.now(),
        failureReason: prepAvailability.reason
      });
      throw new Error(prepAvailability.reason);
    }

    systemState.activePreparations++;
    await executeWithTimeout(
      async (): Promise<void> => { await wait(1000); },
      CONFIG.preparationTimeout,
      'Timeout podczas przygotowania zamówienia'
    );
    systemState.activePreparations--;
    
    stages.push({
      name: 'preparation',
      status: 'completed',
      startTime: prepStartTime,
      endTime: Date.now()
    });

    const deliveryStartTime = Date.now();
    const deliveryAvailability = checkComponentAvailability('delivery');
    
    if (!deliveryAvailability.isAvailable) {
      stages.push({
        name: 'delivery',
        status: 'failed',
        startTime: deliveryStartTime,
        endTime: Date.now(),
        failureReason: deliveryAvailability.reason
      });
      throw new Error(deliveryAvailability.reason);
    }

    systemState.activeDeliveries++;
    await executeWithTimeout(
      async (): Promise<void> => { await wait(800); },
      CONFIG.deliveryTimeout,
      'Timeout podczas dostawy'
    );
    systemState.activeDeliveries--;
    
    stages.push({
      name: 'delivery',
      status: 'completed',
      startTime: deliveryStartTime,
      endTime: Date.now()
    });

    const order: Order = {
      id: orderId,
      stages,
      totalTime: Date.now() - startTime
    };

    res.status(200).json({
      ...order,
      orderStatus: 'completed'
    });
  } catch (error: any) {
    const order: Order = {
      id: orderId,
      stages,
      totalTime: Date.now() - startTime
    };

    res.status(503).json({
      ...order,
      orderStatus: 'failed',
      error: error.message
    });
  } finally {
    systemState.activeOrders--;
  }
};

router.get('/health', (req, res) => {
  res.json({
    status: 'up',
    metrics: {
      ...systemState,
      load: {
        orders: (systemState.activeOrders / CONFIG.maxConcurrentOrders) * 100,
        kitchen: (systemState.activePreparations / CONFIG.maxConcurrentPreparations) * 100,
        delivery: (systemState.activeDeliveries / CONFIG.maxConcurrentDeliveries) * 100
      }
    }
  });
});

router.post('/order', handleOrder);

app.use(router);

app.listen(PORT, () => {
  console.log(`🗿Monolith service running on port ${PORT}`);
});
