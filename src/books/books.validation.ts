import { object, z, ZodType } from "zod";

export class BookValidation {
    static readonly Create: ZodType = z.object({
        title: z.string().min(2),
        author: z.string().min(2),
        publishedYear: z.number(),
        genres: z.array(z.string()),
        stock: z.number()
    })
}