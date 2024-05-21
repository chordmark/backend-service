import { Application } from 'express';
import suggestionRoutes from './suggestion.routes';
import searchRoutes from './search.routes';

export default class Routes {
  constructor(app: Application) {
    app.use('/suggestion', suggestionRoutes);
    app.use('/search', searchRoutes);
  }
}
