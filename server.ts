import dotenv from 'dotenv';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
  ValidationError,
} from './server/taskStore.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }
    next(err);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/api/tasks', async (_req: Request, res: Response) => {
    try {
      const tasks = await listTasks();
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error listing tasks:', error);
      res.status(500).json({ error: 'Failed to retrieve tasks.' });
    }
  });

  app.get('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const task = await getTaskById(String(req.params.id));
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.status(200).json(task);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to retrieve task.' });
    }
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        res.status(400).json({ error: 'Request body must be a JSON object.' });
        return;
      }
      const created = await createTask(req.body);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task.' });
    }
  });

  app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        res.status(400).json({ error: 'Request body must be a JSON object.' });
        return;
      }
      const updated = await updateTask(String(req.params.id), req.body);
      if (!updated) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task.' });
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const deleted = await deleteTask(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.status(200).json({ deleted: true, id: req.params.id });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task.' });
    }
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        const template = await fs.readFile(indexPath, 'utf8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TaskFlow server:', err);
  process.exit(1);
});
