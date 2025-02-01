import express, { Request, Response } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import routes from './routes';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { DriverAddedEventHandler } from './modules/driver/DriverAddedEventHandler';
import { connectToDatabase } from './services/database';


const app = express();
const PORT = process.env.APP_PORT || 3000;

const redisService = RedisService.getInstance();
const rabbitMQService = RabbitMQService.getInstance();

(async () => {
  try {
    await connectToDatabase();
    await redisService.connect();
    await rabbitMQService.connect();
    rabbitMQService.consume("driver_added", (data => {
      new DriverAddedEventHandler().handle(Buffer.from(data).toString())
    }))

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));



    app.post('/publish', async (req: Request, res: Response) => {


      const { queue, message } = req.body;
      try {
        const channel = rabbitMQService.getChannel();
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

        res.status(200).json({ message: `Message sent to queue "${queue}"` });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    // Example route to consume messages from RabbitMQ
    app.get('/consume/:queue', async (req: Request, res: Response) => {
      const { queue } = req.params;

      try {
        const channel = rabbitMQService.getChannel();
        await channel.assertQueue(queue, { durable: true });

        channel.consume(
          queue,
          msg => {
            if (msg) {
              console.log('Message received:', msg.content.toString());
              channel.ack(msg);
            }
          },
          { noAck: false }
        );

        res.status(200).json({ message: `Consuming messages from queue "${queue}"` });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
})();
