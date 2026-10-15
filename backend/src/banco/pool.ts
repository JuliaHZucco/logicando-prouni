import pg from "pg";
import { ambiente } from "../config/ambiente.ts";

export const banco = new pg.Pool({ connectionString: ambiente.bancoUrl });
