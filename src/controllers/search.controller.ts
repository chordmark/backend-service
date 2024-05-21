import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const searches: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to search server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const find = searches.find((s) => {
    return json.search === s.key;
  });
  if (find) {
    find.results = json.results;
    find.resolve(find.results);
  } else {
    const deferred = new Deferred(json.search);
    deferred.results = json.results;
    searches.push(deferred);
  }
});

ws.on('close', () => {
  console.log('Disconnected from search server');
});

export async function search(req: Request, res: Response): Promise<Response> {
  if (req.params.search.length > 0) {
    const find = searches.find((s) => {
      return req.params.search === s.key;
    });
    if (find) {
      console.log('search found:', req.params.search);
      return res.json({
        search: req.params.search,
        results: find.results,
      });
    } else {
      console.log('search lookup:', req.params.search);
      const deferred = new Deferred(req.params.search);
      searches.push(deferred);
      ws.send(JSON.stringify({ search: req.params.search }));
      return await deferred.promise.then((r: any) => {
        res.json({ search: req.params.search, results: r });
      });
    }
  } else {
    return res.json({ search: '', searchResults: [] });
  }
}
