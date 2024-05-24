import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Deferred } from '../class';

const ws = new WebSocket('ws://localhost:4001');

const musicResults: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to music server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const find = musicResults.find((s) => {
    return json.music === s.key;
  });
  if (find) {
    find.results = json.results;
    find.resolve(find.results);
  } else {
    const deferred = new Deferred(json.music);
    deferred.results = json.results;
    musicResults.push(deferred);
  }
});

ws.on('close', () => {
  console.log('Disconnected from music server');
});

export async function music(req: Request, res: Response): Promise<Response> {
  console.log(req.body);
  if (req.body.music.length > 0) {
    const find = musicResults.find((s) => {
      return req.body.music === s.key;
    });
    if (find) {
      console.log('music found:', req.body.music);
      return res.json({
        music: req.body.music,
        result: find.results[0],
      });
    } else {
      console.log('music lookup:', req.body.music);
      const deferred = new Deferred(req.body.music);
      musicResults.push(deferred);
      ws.send(JSON.stringify({ music: req.body.music }));
      return await deferred.promise.then((r: any) => {
        res.json({ music: req.body.music, result: r[0] });
      });
    }
  } else {
    return res.json({ music: '', result: '' });
  }
}
