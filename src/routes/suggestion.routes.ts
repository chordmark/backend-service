import { Router } from 'express';
import { suggestion } from '../controllers/suggestion.controller';

class SuggestionRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get('/:suggest', suggestion);
  }
}

export default new SuggestionRoutes().router;
