import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@utils/errors';

type SchemaType = z.ZodTypeAny | {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

export const validate = (schema: SchemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar si el esquema espera un objeto con body/query/params
      const schemaShape = (schema as any).shape;
      if (schemaShape && ('body' in schemaShape || 'query' in schemaShape || 'params' in schemaShape)) {
        // Si el esquema espera { body, query, params }
        const result = await (schema as any).safeParseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        if (!result.success) {
          console.log('[DEBUG] Validation failed:', JSON.stringify(result.error.errors, null, 2));
          const errorMessages = result.error.errors
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          throw new ValidationError(`Error de validación: ${errorMessages}`);
        }

        // Actualizar los datos validados
        if (result.data.body) req.body = result.data.body;
        if (result.data.query) req.query = result.data.query;
        if (result.data.params) req.params = result.data.params;
      } else {
        // Si el esquema espera los datos directamente
        const result = await (schema as z.ZodTypeAny).safeParseAsync(req.body);
        if (!result.success) {
          const errorMessages = result.error.errors
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          throw new ValidationError(`Error de validación: ${errorMessages}`);
        }
        // Actualizar el body con los datos validados
        req.body = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
