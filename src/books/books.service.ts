import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateBookRequest, BookResponse, BookDTO, UpdateBookRequest, BookFilter } from './books.model'
import { ValidationService } from '../utils/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../utils/prisma.service';
import { Logger } from "winston";
import { BookValidation } from './books.validation';
import { z } from 'zod';
import { WebResponse } from '../utils/web.model';

@Injectable()
export class BooksService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async create(request: CreateBookRequest): Promise<BookResponse> {
    this.logger.info(`Create a new book: ${JSON.stringify(request)}`)

    let createBookRequest: CreateBookRequest
    try {
      createBookRequest = this.validationService.validate(BookValidation.Create, request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          error: error.errors[0].message,
        })
      }
      throw new BadRequestException(error)
    }

    const existingBook = await this.prismaService.book.findUnique({
      where: {
        title: createBookRequest.title
      }
    })

    if (existingBook) {
      throw new ConflictException('Book already exists')
    }

    let existingAuthor = await this.prismaService.author.findFirst({
      where: {
        name: createBookRequest.author
      }
    })

    if (!existingAuthor) {
      existingAuthor = await this.prismaService.author.create({
        data: {
          name: createBookRequest.author
        }
      })
    }

    if (createBookRequest.genres.length < 1) {
      throw new BadRequestException('Book must have at least one genre')
    }

    let book = await this.prismaService.book.create({
      data: {
        title: createBookRequest.title,
        author: {
          connect: {
            id: existingAuthor.id
          }
        },
        published_year: createBookRequest.publishedYear,
        stock: createBookRequest.stock
      }
    })

    const genres: any[] = []
    const bookGenres: any[] = []
    await Promise.all(createBookRequest.genres.map(async (genre: string) => {
      let existingGenre = await this.prismaService.genre.findFirst({
          where: {
              name: genre.toLowerCase()
          }
      });
  
      if (!existingGenre) {
          existingGenre = await this.prismaService.genre.create({ data: { name: genre.toLowerCase() } })
      }
      
      genres.push(existingGenre)
      bookGenres.push({
          book_id: book.id,
          genre_id: existingGenre.id
      })
    }))

    await this.prismaService.book_genre.createMany({
      data: bookGenres
    })
    
    return BookDTO.toBookResponse(book, existingAuthor, genres)
  }

  async findAll(filter: BookFilter): Promise<WebResponse<BookResponse[]>> {
    this.logger.info('Find all books')

    const totalBooks = await this.prismaService.book.count({
      where: {
        OR: [
          {
            title: filter.search? { contains: filter.search } : undefined,
          },
          {
            author: {
              name: filter.search? { contains: filter.search } : undefined,
            },
          },
          {
            genres: {
              some: {
                genre: {
                  name: filter.search? { contains: filter.search } : undefined,
                },
              },
            },
          },
        ],
      },
    })

    const books = await this.prismaService.book.findMany({
      where: {
        OR: [
          {
            title: filter.search ? { contains: filter.search } : undefined,
          },
          {
            author: {
              name: filter.search ? { contains: filter.search } : undefined,
            },
          },
          {
            genres: {
              some: {
                genre: {
                  name: filter.search ? { contains: filter.search } : undefined,
                },
              },
            },
          },
        ],
      },
      include: {
        author: true,
        genres: {
          include: {
            genre: true,
          },
        },
      },
      skip: filter.page ? (filter.page - 1) * filter.limit : undefined,
      take: filter.limit
    })

    const genres = await this.prismaService.genre.findMany()

    const bookResponses: BookResponse[] = []
    for (const book of books) {
        const bookGenres = genres?.filter(genre => book.genres?.some(bookGenre => bookGenre.genre_id === genre.id)) || [];

        bookResponses.push(BookDTO.toBookResponse(book, book.author, bookGenres))
    }
    
    return {
      page: filter.page,
      totalPages: Math.ceil(totalBooks / filter.limit) || 1,
      totalBooks: totalBooks,
      books: bookResponses
    }
  }

  async findOne(id: string): Promise<BookResponse> {
    this.logger.info(`Find book with id ${id}`)

    const book = await this.prismaService.book.findUnique({
      where: {
        id: id
      },
      include: {
        author: true,
        genres: true
      }
    })

    if (!book) {
      throw new NotFoundException('Book not found')
    }

    const bookGenres = await this.prismaService.genre.findMany({
      where: {
        id: {
          in: book.genres.map((genre) => genre.genre_id)
        }
      }
    })

    return BookDTO.toBookResponse(book, book.author, bookGenres)
  }

  async update(id: string, request: UpdateBookRequest): Promise<BookResponse> {
    this.logger.info(`Update book with id ${id}: ${JSON.stringify(request)}`)
    
    let updateBookRequest: UpdateBookRequest
    try {
      updateBookRequest = this.validationService.validate(BookValidation.Update, request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          error: error.errors[0].message,
        })
      }
      throw new BadRequestException(error)
    }

    const existingBook = await this.prismaService.book.findUnique({
      where: {
        id: id
      }
    })

    if (!existingBook) {
      throw new NotFoundException('Book not found')
    }

    let existingAuthor = await this.prismaService.author.findFirst({
      where: {
        name: updateBookRequest.author
      }
    })

    if (!existingAuthor) {
      existingAuthor = await this.prismaService.author.create({
        data: {
          name: updateBookRequest.author
        }
      })
    }

    if (updateBookRequest.genres.length < 1) {
      throw new BadRequestException('Book must have at least one genre')
    }

    let book = await this.prismaService.book.update({
      where: {
        id: id
      },
      data: {
        title: updateBookRequest.title,
        author: {
          connect: {
            id: existingAuthor.id
          }
        },
        published_year: updateBookRequest.publishedYear,
        stock: updateBookRequest.stock
      }
    })

    const genres: any[] = []
    const bookGenres: any[] = []
    await Promise.all(updateBookRequest.genres.map(async (genre: string) => {
      let existingGenre = await this.prismaService.genre.findFirst({
          where: {
              name: genre.toLowerCase()
          }
      });
  
      if (!existingGenre) {
          existingGenre = await this.prismaService.genre.create({ data: { name: genre.toLowerCase() } })
      }
      
      genres.push(existingGenre)
      bookGenres.push({
          book_id: book.id,
          genre_id: existingGenre.id
      })
    }))

    await this.prismaService.book_genre.deleteMany({
      where: {
        book_id: id
      }
    })

    await this.prismaService.book_genre.createMany({
      data: bookGenres
    })
    
    return BookDTO.toBookResponse(book, existingAuthor, genres)
  }

  async remove(id: string): Promise<WebResponse<String>> {
    this.logger.info(`Remove book with id ${id}`)

    const book = await this.prismaService.book.findUnique({
      where: {
        id: id
      }
    })

    console.log(book)

    if (!book) {
      console.log('masuk sini')
      throw new NotFoundException('Book not found')
    }

    await this.prismaService.book_genre.deleteMany({
      where: { book_id: id },
    });

    await this.prismaService.book.delete({
      where: {
        id: id
      }
    })

    return { message: 'Book deleted successfully' }
  }
}
