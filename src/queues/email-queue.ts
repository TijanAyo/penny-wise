import { injectable } from "tsyringe";
import Bull, { Job } from "bull";
import queueConfig from "../config/queue-config";
import { badRequestException } from "../helpers";
import { EmailProcessor } from "./processor/email-processor";

@injectable()
export class EmailQueue {
  private queue: Bull.Queue;

  constructor(private readonly emailProcessor: EmailProcessor) {
    this.queue = new Bull("email", queueConfig);
    this.queue.process(this.processEmailJob.bind(this));
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.queue.on("completed", (job: Job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.queue.on("failed", (job: Job) => {
      console.log(`Job ${job.id} failed with error ${job.failedReason}`);
    });

    this.queue.on("waiting", (jobId: number | string) => {
      console.log(`A job with ID ${jobId} is waiting`);
    });

    this.queue.on("stalled", (job: Job) => {
      console.log(`A job with ID ${job.id} is stalled`);
    });
  }

  private async processEmailJob(job: Job) {
    try {
      const { type, payload } = job.data;

      await job.log(`Processing email job ${job.id} of type ${type}`);

      switch (type) {
        case "forgotPassword":
          await this.emailProcessor.forgotMailWorker(payload);
          break;

        case "emailVerification":
          await this.emailProcessor.emailVerificationWorker(payload);
          break;

        case "createOTP":
          await this.emailProcessor.createOtpWorker(payload);
          break;

        case "credentialChangeNotification":
          await this.emailProcessor.credentialChangeNotificationWorker(payload);
          break;

        default:
          throw new badRequestException("Unknown email job type");
      }

      await job.log(`Email job ${job.id} of type ${type} completed`);
    } catch (err: any) {
      console.log(
        "ProcessEmailJobError:An error occurred while processing job",
      );
      throw err;
    }
  }
  async sendEmailQueue(data: { type: string; payload: any }) {
    try {
      await this.queue.add(data);
      console.log("Email job queued successfully");
      return true;
    } catch (err: any) {
      console.log("Error enqueuing email job");
    }
  }
}
