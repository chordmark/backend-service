import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const searchResults: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to search server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const find = searchResults.find((s) => {
    return json.search === s.key;
  });
  if (find) {
    find.results = json.results;
    find.resolve(find.results);
  } else {
    const deferred = new Deferred(json.search);
    deferred.results = json.results;
    searchResults.push(deferred);
  }
});

ws.on('close', () => {
  console.log('Disconnected from search server');
});

export async function search(req: Request, res: Response): Promise<Response> {
  if (req.body.search.length > 0) {
    const find = searchResults.find((s) => {
      return req.body.search === s.key;
    });
    if (find) {
      console.log('search found:', req.body.search);
      return res.json({
        search: req.body.search,
        results: find.results,
      });
    } else {
      console.log('search lookup:', req.body.search);
      const deferred = new Deferred(req.body.search);
      searchResults.push(deferred);
      ws.send(JSON.stringify({ search: req.body.search }));
      return await deferred.promise.then((r: any) => {
        res.json({ search: req.body.search, results: r });
      });
    }
  } else {
    return res.json({ search: '', searchResults: [] });
  }
}
