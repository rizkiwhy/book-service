import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common'
import { CreateBookRequest, BookResponse, BookDTO } from './books.model'
import { ValidationService } from 'src/utils/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/utils/prisma.service';
import { Logger } from "winston";
import { BookValidation } from './books.validation';

@Injectable()
export class BooksService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async create(request: CreateBookRequest): Promise<BookResponse> {
    this.logger.info(`Create a new book: ${JSON.stringify(request)}`)
    let createBookRequest = this.validationService.validate(BookValidation.Create, request)
    // const createUserInput = BookDTO.toUserCreateInput(createBookRequest)

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

  findAll() {
    return `This action returns all books`;
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
