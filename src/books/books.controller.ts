import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { BooksService } from './books.service'
import { BookResponse, CreateBookRequest, UpdateBookRequest } from './books.model';
import { BadRequestResponse, NotFoundResponse, WebResponse } from 'src/utils/web.model';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiResponse({ status: 200, description: 'The record has been successfully created.', type: BookResponse })
  @ApiResponse({ status: 409, description: 'Error: Conflict', type: NotFoundResponse })
  @ApiResponse({ status: 400, description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiResponse({ status: 500, description: 'Error: Internal Server Error', type: NotFoundResponse })
  async create(@Body() request: CreateBookRequest): Promise<BookResponse> {
    const bookResponse = await this.booksService.create(request)
    return bookResponse
  }

  @Get()
  @ApiResponse({ status: 200, description: 'The found records', type: [BookResponse] })  
  @ApiResponse({ status: 500, description: 'Error: Internal Server Error', type: NotFoundResponse })
  async findAll(): Promise<BookResponse[]> {
    const bookResponses = await this.booksService.findAll()
    return bookResponses
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'The found record', type: BookResponse })
  @ApiResponse({ status: 404, description: 'Book not found', type: NotFoundResponse })
  @ApiResponse({ status: 500, description: 'Error: Internal Server Error', type: NotFoundResponse })
  async findOne(@Param('id') id: string): Promise<BookResponse> {
    const bookResponse = await this.booksService.findOne(id)
    
    return bookResponse
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The updated record', type: BookResponse })
  @ApiResponse({ status: 404, description: 'Book not found', type: NotFoundResponse })
  @ApiResponse({ status: 400, description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiResponse({ status: 500, description: 'Error: Internal Server Error', type: NotFoundResponse })
  update(@Param('id') id: string, @Body() request: UpdateBookRequest): Promise<BookResponse> {
    const bookResponse = this.booksService.update(id, request)

    return bookResponse
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
