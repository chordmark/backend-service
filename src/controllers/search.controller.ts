import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Search, Href } from '../models';
import { customAlphabet } from 'nanoid';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 16);

const searchResults: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to search server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const index = searchResults.findIndex((s) => {
    return json.search === s.key;
  });
  Promise.all(
    json.results.map(async (j: any) => {
      const h = await Href.findOne({ href: j.href });
      if (h) {
        return {
          artist: j.artist,
          song: j.song,
          type: j.type,
          shortId: h.shortId,
        };
      } else {
        const s = nanoid();
        new Href({ href: j.href, shortId: s }).save();
        return {
          artist: j.artist,
          song: j.song,
          type: j.type,
          shortId: s,
        };
      }
    })
  ).then((results) => {
    if (index > -1) {
      const find = searchResults[index];
      find.resolve(results);
      searchResults.splice(index, 1);
    }
    try {
      new Search({
        search: json.search,
        results: results,
      }).save();
    } catch (e) {
      console.log('mongo search save error:', e);
    }
  });
});

ws.on('close', () => {
  console.log('Disconnected from search server');
});

export async function search(req: Request, res: Response): Promise<Response> {
  if (req.body.search.length > 0) {
    const find = await Search.findOne({ search: req.body.search }).exec();
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
