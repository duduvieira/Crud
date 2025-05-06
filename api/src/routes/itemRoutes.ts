import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';

const router = Router();

const itemSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
});

// Criar item
router.post('/items', async (req: Request, res: Response) => {
    try {
        console.log('Requisição recebida:', req.body);
        const validatedData = itemSchema.parse(req.body);
        const { nome } = validatedData;
        console.log('Dados validados:', { nome });
        const result = await pool.query(
            'INSERT INTO items (nome) VALUES ($1) RETURNING id, nome, created_at',
            [nome]
        );
        console.log('Resultado da query:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Erro de validação:', error.errors);
            return res.status(400).json({ error: error.errors });
        }
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: 'Erro ao criar item', details: error });
    }
});

// Listar itens
router.get('/items', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM items');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar itens' });
    }
});

// Atualizar item
router.put('/items/:id', async (req: Request, res: Response) => {
    try {
        const validatedData = itemSchema.parse(req.body);
        const { id } = req.params;
        const { nome } = validatedData;
        const result = await pool.query(
            'UPDATE items SET nome = $1 WHERE id = $2 RETURNING *',
            [nome, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Erro ao atualizar item' });
    }
});

// Deletar item
router.delete('/items/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json({ message: 'Item deletado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar item' });
    }
});

export default router;