import HomeView from '../views/home-view';

export default class HomePresenter {
  #view = null;

  constructor() {
    this.#view = new HomeView();
  }

  async render() {
    return this.#view.render();
  }

  async afterRender() {
    // Logic goes here
  }
}
