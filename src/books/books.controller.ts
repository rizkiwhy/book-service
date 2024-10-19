import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { BooksService } from './books.service'
import { BookResponse, CreateBookRequest } from './books.model';
import { WebResponse } from 'src/utils/web.model';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiResponse({ type: BookResponse })
  async create(@Body() request: CreateBookRequest): Promise<WebResponse<BookResponse>> {
    const bookResponse = await this.booksService.create(request)

    return {
      data: bookResponse
    } 
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() request) {
    return this.booksService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
