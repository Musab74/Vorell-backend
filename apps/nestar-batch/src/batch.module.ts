import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './batch.service';

@Module({
	imports: [ConfigModule.forRoot(), DatabaseModule, ScheduleModule.forRoot()],
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
