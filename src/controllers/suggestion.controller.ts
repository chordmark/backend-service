import { Request, Response } from 'express';
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:4001');

class Deferred {
  search: any;
  suggestions: any;
  promise: any;
  resolve: any;
  reject: any;

  constructor(search: any) {
    this.search = search;
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

const suggestions: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to server');
});

ws.on('message', (message: string) => {
  const result = JSON.parse(message);
  const find = suggestions.find((s) => {
    return result.search === s.search;
  });
  if (find) {
    find.suggestions = result.suggestions;
    find.resolve(find.suggestions);
  } else {
    const deferred = new Deferred(result.search);
    deferred.suggestions = result.suggestions;
    suggestions.push(deferred);
  }
});

ws.on('close', () => {
  console.log('Disconnected from server');
});

export async function suggestion(
  req: Request,
  res: Response
): Promise<Response> {
  let lookup = req.params.search;
  if (lookup.length > 5) {
    lookup = lookup.substring(0, 5);
  }
  if (lookup.length > 0) {
    const find = suggestions.find((s) => {
      return lookup === s.search;
    });
    if (find) {
      console.log('found:', lookup);
      return res.json({
        search: req.params.search,
        suggestions: find.suggestions.filter((f: string) => {
          return f.startsWith(req.params.search);
        }),
      });
    } else {
      console.log('lookup:', lookup);
      ws.send(JSON.stringify({ search: lookup }));
      const deferred = new Deferred(lookup);
      suggestions.push(deferred);
      return await deferred.promise.then((r: any) => {
        const filtered = r.filter((f: string) => {
          return f.startsWith(req.params.search);
        });
        res.json({ search: req.params.search, suggestions: filtered });
      });
    }
  } else {
    return res.json({ search: '', suggestions: [] });
  }
}
