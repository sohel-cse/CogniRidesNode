import amqplib, { Connection, Channel } from 'amqplib';

export class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private uri: string;

  private constructor() {
    this.uri = process.env.RABBITMQ_URI || 'amqp://localhost';  // Use your RabbitMQ URI here
  }

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  // Connect to RabbitMQ server and create channel
  public async connect(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqplib.connect(this.uri);
        this.channel = await this.connection.createChannel();
        console.log('✅ RabbitMQ connection successful!');
      }
    } catch (error) {
      console.error('❌ RabbitMQ connection failed:', error);
      throw error;
    }
  }

  // Return the channel
  public getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized. Call connect() first.');
    }
    return this.channel;
  }

  // Close connection and channel
  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        console.log('RabbitMQ channel closed');
      }
      if (this.connection) {
        await this.connection.close();
        console.log('RabbitMQ connection closed');
      }
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  // Publish message to a fanout exchange
  public async publishToExchange(exchange: string, message: any): Promise<void> {
    try {
      const channel = this.getChannel();
      await channel.assertExchange(exchange, 'fanout', { durable: true });  // Ensure the exchange exists
      channel.publish(exchange, '', Buffer.from(JSON.stringify(message))); // Publish to the exchange (no routing key for fanout)
      console.log('Message published to exchange:', exchange);
    } catch (err) {
      console.error('Error publishing message to exchange:', err);
    }
  }

  public async publishToQueue(name: string, message: any): Promise<void> {
    try {
      const channel = this.getChannel();
      channel.sendToQueue(name, Buffer.from(JSON.stringify(message))); 
      console.log('Message published to queue:', name);
    } catch (err) {
      console.error('Error publishing message to queue:', err);
    }
  }

  // Consume messages from a fanout exchange
  public async consumeFromExchange(exchange: string, onReceive: (data: any) => void): Promise<void> {
    try {
      const channel = this.getChannel();

      // Declare an exclusive, temporary queue for the consumer
      const queue = await channel.assertQueue('matchmaking_driver', { durable: true });

      // Bind the queue to the fanout exchange
      await channel.bindQueue(queue.queue, exchange, '');

      // Start consuming messages from the queue
      channel.consume(
        queue.queue,
        (msg) => {
          if (msg) {
            const messageContent = Buffer.from(msg.content).toString();
            console.log('Message received:', messageContent);

            // Call the handler function passed by the consumer
            onReceive(messageContent);

            // Acknowledge the message to remove it from the queue
            channel.ack(msg);
          }
        },
        { noAck: false }  // Set to false to require message acknowledgement
      );
    } catch (err) {
      console.error('Error consuming from exchange:', err);
    }
  }

  public async consumeFromQueue(queue_name: string, onReceive: (data: any) => void): Promise<void> {
    try {
      const channel = this.getChannel();

      // Declare an exclusive, temporary queue for the consumer
      const queue = await channel.assertQueue(queue_name, { durable: true });

      // Bind the queue to the fanout exchange
      // await channel.bindQueue(queue.queue, exchange, '');

      // Start consuming messages from the queue
      channel.consume(
        queue.queue,
        (msg) => {
          if (msg) {
            const messageContent = Buffer.from(msg.content).toString();
            console.log('Message received:', messageContent);

            // Call the handler function passed by the consumer
            onReceive(messageContent);

            // Acknowledge the message to remove it from the queue
            channel.ack(msg);
          }
        },
        { noAck: false }  // Set to false to require message acknowledgement
      );
    } catch (err) {
      console.error('Error consuming from exchange:', err);
    }
  }
}
