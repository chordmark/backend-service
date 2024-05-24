import { Router } from 'express';
import { suggest } from '../controllers/suggest.controller';

class SuggestionRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post('/', suggest);
  }
}

export default new SuggestionRoutes().router;
