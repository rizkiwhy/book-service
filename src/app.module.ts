import { Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';
import { BooksModule } from './books/books.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UtilsModule, 
    BooksModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
