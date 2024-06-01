import { Request, Response } from 'express';
import WebSocket from 'ws';
import { Deferred } from '../class';
import { Href, Music } from '../models';

const ws = new WebSocket('ws://localhost:4001');

const musicResults: Deferred[] = [];

ws.on('open', () => {
  console.log('Connected to music server');
});

ws.on('message', (message: string) => {
  const json = JSON.parse(message);
  const index = musicResults.findIndex((s) => {
    return json.music === s.key;
  });
  if (index > -1) {
    const find = musicResults[index];
    find.resolve(json.result);
    musicResults.splice(index, 1);
  }
  Href.findOne({ href: json.music }).then((href: any) => {
    new Music({ shortId: href.shortId, song: json.result }).save();
  });
});

ws.on('close', () => {
  console.log('Disconnected from music server');
});

export async function music(req: Request, res: Response): Promise<Response> {
  console.log(req.body);
  if (req.body.music.length > 0) {
    const find = await Music.findOne({ shortId: req.body.music }).exec();
    if (find) {
      console.log('music found:', req.body.music);
      return res.json({
        music: req.body.music,
        result: find.song,
      });
    } else {
      const href = await Href.findOne({ shortId: req.body.music }).exec();
      if (href) {
        console.log('music lookup:', href.href);
        const deferred = new Deferred(href.href);
        musicResults.push(deferred);
        ws.send(JSON.stringify({ music: href.href }));
        return await deferred.promise.then((r: any) => {
          res.json({ music: req.body.music, result: r });
        });
      }
    }
  }
  return res.json({ music: '', result: '' });
}
