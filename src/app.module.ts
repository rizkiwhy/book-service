import { Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [UtilsModule, BooksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
