import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ValidationService } from '../utils/validation.service';
import { PrismaService } from '../utils/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WebResponse } from '../utils/web.model';
import { BookFilter, BookResponse } from './books.model';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  beforeEach(async () => {
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const mockValidationService = {
      validate: jest.fn().mockReturnValue({ 
        title: 'Mock Book Title', 
        author: 'Mock Author',
        genres: ['Test'],
      }),
    };

    const mockPrismaService = {
      book: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: '1', title: 'Mock Book Title' }),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([{ id: '1', title: 'Mock Book Title' }]),
        update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Mock Book Title' }),
        delete: jest.fn().mockResolvedValue({ count: 1 }),
        findOne: jest.fn().mockResolvedValue({ id: '1', title: 'Mock Book Title' }),
      },
      author: {
        findFirst: jest.fn().mockResolvedValue({ id: 'author-id', name: 'Mock Author' }),
      },
      genre: {
        findFirst: jest.fn().mockResolvedValue({ id: 'genre-id', name: 'Test' }),
        findMany: jest.fn().mockResolvedValue([{ id: 'genre-id', name: 'Test' }]),
      },
      book_genre: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        BooksService,
        {
          provide: ValidationService,
          useValue: mockValidationService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'winston',
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  describe('POST /books', () => {
    it('should create a new book', async () => {
      const result = await controller.create({
        title: 'Mock Book Title', 
        author: 'Mock Author',
        publishedYear: 0,
        genres: ["test"],
        stock: 0
      });
      expect(result).toHaveProperty('id');
      expect(result.title).toEqual('Mock Book Title');
    })

    it('should throw an error if the book already exists', async () => {
      jest.spyOn(service, 'create').mockImplementationOnce(async () => {
        throw new ConflictException('Book already exists');
      });
      await expect(controller.create({
        title: 'Mock Book Title', 
        author: 'Mock Author',
        publishedYear: 0,
        genres: ["test"],
        stock: 0
      })).rejects.toThrow(ConflictException);
    })
    it('should be rejected if the request body is invalid', async () => {
      jest.spyOn(service, 'create').mockImplementationOnce(async () => {
        throw new Error('Invalid request');
      });
      await expect(controller.create({
        title: '', author: '',
        publishedYear: 0,
        genres: ["test"],
        stock: 0
      })).rejects.toThrow('Invalid request');
    })
    it('should be rejected if the author does not exist', async () => {
      jest.spyOn(service, 'create').mockImplementationOnce(async () => {
        throw new Error('Invalid request');
      });
      await expect(controller.create({
        title: 'Mock Book Title', 
        author: 'Invalid Author',
        publishedYear: 0,
        genres: ["test"],
        stock: 0
      })).rejects.toThrow('Invalid request');
    })
    it('should be rejected if the genres do not exist', async () => {
      jest.spyOn(service, 'create').mockImplementationOnce(async () => {
        throw new Error('Invalid request');
      });
      await expect(controller.create({
        title: 'Mock Book Title', 
        author: 'Mock Author',
        publishedYear: 0,
        genres: [],
        stock: 0
      })).rejects.toThrow('Invalid request');
    })
  });

  describe('GET /books', () => {
    it('should return a list of books', async () => {
      const mockBooks = [
        { id: '1', title: 'Mock Book Title 1', author: 'Mock Author 1', publishedYear: 2021, genres: ['genre-id-1'], stock: 10 },
        { id: '2', title: 'Mock Book Title 2', author: 'Mock Author 2', publishedYear: 2022, genres: ['genre-id-2'], stock: 5 },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue({
        page: 1,
        totalPages: 1,
        totalBooks: 2,
        books: mockBooks,
      });

      const result = await controller.findAll();

      expect(result.books).toEqual(mockBooks);
      expect(result.totalBooks).toBe(2);
    });

    it('should return an empty list if no books are found', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue({
        page: 1,
        totalPages: 1,
        totalBooks: 0,
        books: [],
      });

      const result = await controller.findAll();

      expect(result.books).toEqual([]);
      expect(result.totalBooks).toBe(0);
    });

    it('should filter books by search criteria', async () => {
      const mockBooks = [
        { id: '1', title: 'Mock Book Title 1', author: 'Mock Author 1', publishedYear: 2021, genres: ['genre-id-1'], stock: 10 },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue({
        page: 1,
        totalPages: 1,
        totalBooks: 1,
        books: mockBooks,
      });

      const result = await controller.findAll();

      expect(result.books).toEqual(mockBooks);
      expect(result.totalBooks).toBe(1);
    });
  });

  describe('GET /books/:id', () => {
    it('should return a book by ID', async () => {
      const mockBook = {
        id: '1',
        title: 'Mock Book Title',
        author: 'Mock Author' ,
        publishedYear: 2021,
        genres: ['genre-id'],
        stock: 10,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockBook);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockBook);
    });

    it('should throw a NotFoundException if the book does not exist', async () => {
      jest.spyOn(service, 'findOne').mockImplementationOnce(async () => {
        throw new NotFoundException('Book not found');
      });
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });


  describe('DELETE /books/:id', () => {
    it('should delete a book', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({ message: 'Book deleted successfully' });
  
      const result = await controller.remove('1');
  
      expect(result).toEqual({ message: 'Book deleted successfully' });
    });
  
    it('should throw a NotFoundException if the book does not exist', async () => {
      jest.spyOn(service, 'remove').mockImplementationOnce(async () => {
        throw new NotFoundException('Book not found');
      });
  
      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  
    it('should throw an error if deletion fails', async () => {
      jest.spyOn(service, 'remove').mockImplementationOnce(async () => {
        throw new Error('Deletion failed');
      });
  
      await expect(controller.remove('1')).rejects.toThrow('Deletion failed');
    });
  });
  
});
