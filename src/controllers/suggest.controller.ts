import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const suggestResults: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to suggestion server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const find = suggestResults.find((s) => {
    return json.suggest === s.key;
  });
  if (find) {
    find.results = json.results;
    find.resolve(find.results);
  } else {
    const deferred = new Deferred(json.suggest);
    deferred.results = json.results;
    suggestResults.push(deferred);
  }
});

ws.on('close', () => {
  console.log('Disconnected from suggestion server');
});

export async function suggest(req: Request, res: Response): Promise<Response> {
  let lookup = req.body.suggest;
  if (lookup.length > 5) {
    lookup = lookup.substring(0, 5);
  }
  if (lookup.length > 0) {
    const find = suggestResults.find((s) => {
      return lookup === s.key;
    });
    if (find) {
      console.log(
        'suggest found:',
        `:${req.body.suggest}:`,
        find.results.length
      );
      return res.json({
        suggest: req.body.suggest,
        results: find.results.filter((f: string) => {
          return f.startsWith(req.body.suggest);
        }),
      });
    } else {
      console.log('suggest lookup:', `:${lookup}:`);
      ws.send(JSON.stringify({ suggest: lookup }));
      const deferred = new Deferred(lookup);
      suggestResults.push(deferred);
      return await deferred.promise.then((r: any) => {
        const filtered = r.filter((f: string) => {
          return f.startsWith(req.body.suggest);
        });
        res.json({ suggest: req.body.suggest, results: filtered });
      });
    }
  } else {
    return res.json({ suggest: '', results: [] });
  }
}
