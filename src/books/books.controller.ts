import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common'
import { BooksService } from './books.service'
import { BookFilter, BookResponse, CreateBookRequest, UpdateBookRequest } from './books.model';
import { BadRequestResponse, DeleteSuccessfullyResponse, NotFoundResponse, WebResponse } from 'src/utils/web.model';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: BookResponse })
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
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search for books by title or keywords' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records per page' })
  async findAll(@Query('search') search?: string, @Query('page') page?: number, @Query('limit') limit?: number): Promise<WebResponse<BookResponse[]>> {
    const bookFilter: BookFilter = {
      search: search || undefined,
      page: page ? Number(page) : undefined,
      limit: limit? Number(limit) : undefined
    }
    const bookResponses = await this.booksService.findAll(bookFilter)

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
  @ApiResponse({ status: 200, description: 'The deleted record', type: DeleteSuccessfullyResponse })
  @ApiResponse({ status: 404, description: 'Book not found', type: NotFoundResponse })
  @ApiResponse({ status: 500, description: 'Error: Internal Server Error', type: NotFoundResponse })
  async remove(@Param('id') id: string): Promise<WebResponse<String>> {
    const bookResponse = this.booksService.remove(id)

    return bookResponse
  }
}
