import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { OutBoxModule } from 'src/outBox/outBox.module';

@Module({
  imports: [OutBoxModule],
  providers: [TasksService],
})
export class TasksModule {}
