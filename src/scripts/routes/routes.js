import HomePresenter from '../presenters/home-presenter';
import AboutPresenter from '../presenters/about-presenter';
import LoginPresenter from '../presenters/login-presenter';
import RegisterPresenter from '../presenters/register-presenter';
import StoriesPresenter from '../presenters/stories-presenter';
import AddStoryPresenter from '../presenters/add-story-presenter';
import FavoritesPresenter from '../presenters/favorites-presenter';

const routes = {
  '/': new HomePresenter(),
  '/about': new AboutPresenter(),
  '/register': new RegisterPresenter(),
  '/stories': new StoriesPresenter(),
  '/login': new LoginPresenter(),
  '/add-story': new AddStoryPresenter(),
  '/favorites': new FavoritesPresenter(),
};

export default routes;
