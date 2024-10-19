import { ApiProperty } from "@nestjs/swagger";

export class WebResponse<T> {
    data?: T
    error?: string
    message?: string
}

export class DeleteSuccessfullyResponse<T> extends WebResponse<T> {
    @ApiProperty({ example: 'Book deleted successfully' })
    message: string
}

export class InternalServerErrorResponse {
    @ApiProperty({ example: 'Internal Server Error' })
    message: string

    @ApiProperty({ example: 500 })
    statusCode: number
}

export class NotFoundResponse {
    @ApiProperty({ example: 'Book not found' })
    message: string

    @ApiProperty({ example: 'Not Found' })
    error: string

    @ApiProperty({ example: 404 })
    statusCode: number

}

export class ErrorConflictResponse {
    @ApiProperty({ example: 'Book already exists' })
    message: string

    @ApiProperty({ example: 'Conflict' })
    error: string

    @ApiProperty({ example: 409 })
    statusCode: number
}

export class BadRequestResponse {
    @ApiProperty({ example: 'Validation failed' })
    message: string

    @ApiProperty({ example: 'Bad Request' })
    error: string

    @ApiProperty({ example: 400 })
    statusCode: number
}