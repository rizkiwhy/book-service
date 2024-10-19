import { object, z, ZodType } from "zod";

export class BookValidation {
    static readonly Create: ZodType = z.object({
        title: z.string({
            message: 'Title must be a string'
        }).min(2, {
            message: 'Title must be at least 2 characters'
        }),
        author: z.string({
            message: 'Author must be a string'
        }).min(2, {
            message: 'Author must be at least 2 characters'
        }),
        publishedYear: z.number({
            message: 'Published year must be a number'
        }),
        genres: z.array(z.string({
            message: 'Genres must be an array of strings'
        })),
        stock: z.number({
            message: 'Stock must be a number'
        })
    })

    static readonly Update: ZodType = z.object({
        title: z.string({
            message: 'Title must be a string'
        }).min(2, {
            message: 'Title must be at least 2 characters'
        }),
        author: z.string({
            message: 'Author must be a string'
        }).min(2, {
            message: 'Author must be at least 2 characters'
        }),
        publishedYear: z.number({
            message: 'Published year must be a number'
        }),
        genres: z.array(z.string({
            message: 'Genres must be an array of strings'
        })),
        stock: z.number({
            message: 'Stock must be a number'
        })
    })
}