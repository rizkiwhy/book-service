import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { ValidationService } from '../utils/validation.service';
import { PrismaService } from '../utils/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;

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
      findMany: jest.fn().mockResolvedValue([
        {
          id: '1',
          title: 'Mock Book Title',
          published_year: 2021,
          stock: 10,
          author: { id: 'author-id', name: 'Mock Author' }, // Include mock author data
          genres: [{ genre_id: 'genre-id' }]
        }
      ]),  
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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const result = await service.findAll({});
      expect(result.books).toHaveLength(1);
      expect(result.books[0]).toHaveProperty('id', '1');
      expect(result.books[0]).toHaveProperty('author', 'Mock Author'); 
    });

    it('should return an empty array if no books are found', async () => {
      mockPrismaService.book.findMany.mockResolvedValueOnce([]);
      const result = await service.findAll({});
      expect(result.books).toHaveLength(0); 
      expect(result.totalBooks).toBe(0);
    });
  });

  describe('when create is called', () => {
    it('should be create a new book', async () => {
      const result = await service.create({
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
      jest.spyOn(mockPrismaService.book, 'findUnique').mockImplementationOnce(async () => {
        throw new Error('Book already exists');
      });
      await expect(service.create({
        title: 'Mock Book Title', 
        author: 'Mock Author',
        publishedYear: 0, 
        genres: ["test"],
        stock: 0
      })).rejects.toThrow(new Error('Book already exists'))
    })
    it('shoud be rejected if the author does not exist', async () => {
      jest.spyOn(mockPrismaService.author, 'findFirst').mockImplementationOnce(async () => {
        throw new Error('Author not found');
      });
      await expect(service.create({
        title: 'Mock Book Title', 
        author: 'Invalid Author',
        publishedYear: 0,
        genres: ["test"],
        stock: 0
      })).rejects.toThrow(new Error('Author not found'))
    })
  })

});
