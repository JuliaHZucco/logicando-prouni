declare global {
  namespace Express {
    interface Request {
      visitanteId?: number;
      moderadorId?: number;
    }
  }
}

export {};
