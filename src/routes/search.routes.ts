import { Router } from 'express';
import { search } from '../controllers/search.controller';

class SearchRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post('/', search);
  }
}

export default new SearchRoutes().router;
