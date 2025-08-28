import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_WATCHES } from './libs/config';

@Controller()
export class BatchController {
  private logger: Logger = new Logger('BatchController');

  constructor(private readonly batchService: BatchService) {}

  @Timeout(1000)
  handleTimeout() {
    this.logger.debug('BATCH SERVER READY!');
  }

  // Every minute at second 0
  @Cron('0 0 3 * * *', { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger['context'] = BATCH_ROLLBACK;
      this.logger.debug('EXECUTED!');
      await this.batchService.batchRollback();
    } catch (err) {
      this.logger.error(err);
    }
  }

  // Every minute at second 20
  @Cron('20 0 3 * * *', { name: BATCH_TOP_WATCHES })
  public async batchWatches() {
    try {
      this.logger['context'] = BATCH_TOP_WATCHES;
      this.logger.debug('EXECUTED!');
      await this.batchService.batchTopWatches(); // computes top **watches**
    } catch (err) {
      this.logger.error(err);
    }
  }

  // Every minute at second 40
  @Cron('40 0 3 * * *', { name: BATCH_TOP_AGENTS })
  public async batchStores() {
    try {
      this.logger['context'] = BATCH_TOP_AGENTS;
      this.logger.debug('EXECUTED!');
      await this.batchService.batchTopAgents(); // computes top **stores/members**
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Get()
  getHello(): string {
    return this.batchService.getHello();
  }
}
