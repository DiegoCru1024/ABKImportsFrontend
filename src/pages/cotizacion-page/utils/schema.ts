import { z } from "zod";

export const productoSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    quantity: z.number().min(1, { message: "La cantidad es requerida" }),
    size: z.string().min(1, { message: "El tamaño es requerido" }),
    color: z.string().min(1, { message: "El color es requerido" }),
    url: z.string().optional(),
    comment: z.string().optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
    number_of_boxes: z.number().optional(),
    attachments: z.array(z.string()).optional(),
  });
  