import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger"
import { author, book, genre } from "@prisma/client"
import { v4 as uuid } from 'uuid';

export class CreateBookRequest {
    @ApiProperty({
        example: 'Harry Potter and the Philosopher\'s Stone',
        description: 'The title of the book',
    })
    title: string
    @ApiProperty({
        example: 'J.K. Rowling',
        description: 'The author of the book',
    })
    author: string
    @ApiProperty({
        example: 1997,
        description: 'The year the book was published',
    })
    publishedYear: number
    @ApiProperty({
        example: ['fantasy', 'fiction'],
        description: 'The genres of the book',
    })
    genres: string[]
    @ApiProperty({
        example: 10,
        description: 'The number of books in stock',
    })
    stock: number
}

export class BookResponse {
    @ApiResponseProperty({
        example: '04c3aa33-8e31-11ef-a92b-0242ac150002',
        type: 'string',
    })
    id: string
    @ApiResponseProperty({
        example: 'Harry Potter and the Philosopher\'s Stone',
        type: 'string',
    })
    title: string
    @ApiResponseProperty({
        example: 'J.K. Rowling',
        type: 'string',
    })
    author: string
    @ApiResponseProperty({
        example: 1997,
        type: 'number',
    })
    publishedYear: number
    @ApiResponseProperty({
        example: ['fantasy', 'fiction'],
        type: 'array',
    })
    genres: string[]
    @ApiResponseProperty({
        example: 10,
        type: 'number',
    })
    stock: number
}

export class BookDTO {
    static toBookResponse(book: book, author: author, genres: genre[]): BookResponse {
        return {
            id: book.id,
            title: book.title,
            author: author.name,
            publishedYear: book.published_year,
            genres: genres.map((genre) => genre.name),
            stock: book.stock
        }
    }
}
