import { Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [UtilsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
