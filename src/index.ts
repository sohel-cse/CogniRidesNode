import express, { Request, Response } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import routes from './routes';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { DriverAddedEventHandler } from './modules/driver/DriverAddedEventHandler';
import { connectToDatabase } from './services/database';
import { GetMatchCommand } from './modules/match/GetMatchCommand';
import { GetMatchCommandDto } from './modules/match/GetMatchCommandDto';
import { GetMatchCommandHandler } from './modules/match/GetMatchCommandHandler';
import { BroadcastService } from './services/broadcast.service';


const app = express();
const PORT = process.env.APP_PORT || 3000;

const redisService = RedisService.getInstance();
const rabbitMQService = RabbitMQService.getInstance();
const broadcastService = new BroadcastService();

(async () => {
  try {
    await connectToDatabase();
    await redisService.connect();
    await rabbitMQService.connect();
    rabbitMQService.consumeFromExchange('passenger_registration_exchange', (data: string) => {
      new DriverAddedEventHandler().handle(data);  // Example event handler
    });

    rabbitMQService.consumeFromQueue('get_match_command_2', (data: string) => {
      const drivers: GetMatchCommandDto[] = JSON.parse(data)
      new GetMatchCommandHandler().handle(new GetMatchCommand(drivers));  // Example event handler
    });
   

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/accept', async (req: Request, res: Response) => {
      console.log('Accepted=======', req.body)
      const id = req.body.id;
      const data = await broadcastService.accept(id);

      await rabbitMQService.publishToExchange('get_match_result', {
        driver: data?.currentDriver
      })

      res.status(200).send();
    })

    app.post('/reject', async (req: Request, res: Response) => {
      const { id, driverId } = req.body;
      await broadcastService.reject(id, driverId);

      res.status(200).send();
    })

    app.post('/publish', async (req: Request, res: Response) => {
      try {
        
        await rabbitMQService.publishToQueue('get_match_command_2', [
          {
              "fcmToken": "token1",
              "driverId": 1,
              "name": "D1"
          },
          {
              "fcmToken": "token2",
              "driverId": 2,
              "name": "D2"
          },
          {
              "fcmToken": "token3",
              "driverId": 3,
              "name": "D3"
          }
      ]);
        
        res.status(200).json({ message: `Message published successfully` });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    // Example route to consume messages from RabbitMQ
    app.get('/consume/:queue', async (req: Request, res: Response) => {
      // const { queue } = req.params;

      // // try {
      // //   const channel = rabbitMQService.getChannel();
      // //   await channel.assertQueue(queue, { durable: true });

      // //   channel.consume(
      // //     queue,
      // //     msg => {
      // //       if (msg) {
      // //         console.log('Message received:', msg.content.toString());
      // //         channel.ack(msg);
      // //       }
      // //     },
      // //     { noAck: false }
      // //   );

      //   res.status(200).json({ message: `Consuming messages from queue "${queue}"` });
      // } catch (err) {
      //   res.status(500).json({ error: err });
      // }
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
})();
