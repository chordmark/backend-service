import { Application } from 'express';
import suggestionRoutes from './suggestion.routes';

export default class Routes {
  constructor(app: Application) {
    app.use('/suggestion', suggestionRoutes);
  }
}
