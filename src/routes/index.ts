import { Application } from 'express';
import suggestRoutes from './suggest.routes';
import searchRoutes from './search.routes';
import musicRoutes from './music.routes';

export default class Routes {
  constructor(app: Application) {
    app.use('/suggest', suggestRoutes);
    app.use('/search', searchRoutes);
    app.use('/music', musicRoutes);
  }
}
