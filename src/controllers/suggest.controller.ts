import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Suggest } from '../models';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const suggestResults: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to suggestion server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const index = suggestResults.findIndex((s) => {
    return json.suggest === s.key;
  });
  if (index > -1) {
    const find = suggestResults[index];
    find.resolve(json.results);
    suggestResults.splice(index, 1);
  }
  try {
    new Suggest({ suggest: json.suggest, results: json.results }).save();
  } catch (e) {
    console.log('mongo suggest save error:', e);
  }
});

ws.on('close', () => {
  console.log('Disconnected from suggestion server');
});

export async function suggest(req: Request, res: Response): Promise<Response> {
  let lookup = req.body.suggest;
  if (lookup.length > 5) {
    lookup = lookup.substring(0, 5).toLowerCase();
  }
  if (lookup.length > 0) {
    const find = await Suggest.findOne({ suggest: lookup }).exec();
    if (find) {
      console.log('suggest found:', lookup);
      return res.json({
        suggest: req.body.suggest,
        results: find.results.filter((f: string) => {
          return f.startsWith(req.body.suggest);
        }),
      });
    } else {
      console.log('suggest lookup:', lookup);
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
