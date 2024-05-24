import { Router } from 'express';
import { music } from '../controllers/music.controller';

class MusicRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post('/', music);
  }
}

export default new MusicRoutes().router;
