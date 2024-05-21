import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const suggestions: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to suggestion server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const find = suggestions.find((s) => {
    return json.suggest === s.key;
  });
  if (find) {
    find.results = json.results;
    find.resolve(find.results);
  } else {
    const deferred = new Deferred(json.suggest);
    deferred.results = json.results;
    suggestions.push(deferred);
  }
});

ws.on('close', () => {
  console.log('Disconnected from suggestion server');
});

export async function suggestion(
  req: Request,
  res: Response
): Promise<Response> {
  let lookup = req.params.suggest;
  if (lookup.length > 5) {
    lookup = lookup.substring(0, 5);
  }
  if (lookup.length > 0) {
    const find = suggestions.find((s) => {
      return lookup === s.key;
    });
    if (find) {
      console.log('suggest found:', lookup);
      return res.json({
        suggest: req.params.suggest,
        results: find.results.filter((f: string) => {
          return f.startsWith(req.params.suggest);
        }),
      });
    } else {
      console.log('suggest lookup:', lookup);
      ws.send(JSON.stringify({ suggest: lookup }));
      const deferred = new Deferred(lookup);
      suggestions.push(deferred);
      return await deferred.promise.then((r: any) => {
        const filtered = r.filter((f: string) => {
          return f.startsWith(req.params.suggest);
        });
        res.json({ suggest: req.params.suggest, results: filtered });
      });
    }
  } else {
    return res.json({ suggest: '', results: [] });
  }
}
