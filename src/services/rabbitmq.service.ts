import amqplib, { Connection, Channel } from 'amqplib';

export class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private uri: string;

  private constructor() {
    this.uri = process.env.RABBITMQ_URI || 'amqp://localhost';
  }

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqplib.connect(this.uri);
        this.channel = await this.connection.createChannel();
        console.log('Connected to RabbitMQ');
      }
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  public getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized. Call connect() first.');
    }
    return this.channel;
  }

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

  async consume(queue: string,  onReceive: (data: any)=> void) {
    try {
      if (this.channel) {
        await this.channel.assertQueue(queue, { durable: true });

        this.channel.consume(
          queue,
          msg => {
            if (msg) {
              console.log('Message received:', Buffer.from(msg.content).toString());
              onReceive(msg.content)
              this.channel?.ack(msg);
            }
          },
          { noAck: false }
        );
      }
    } catch (err) {
      console.log({ err });
    }
  }
}
