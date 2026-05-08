import AboutView from '../views/about-view';

export default class AboutPresenter {
  #view = null;

  constructor() {
    this.#view = new AboutView();
  }

  async render() {
    return this.#view.render();
  }

  async afterRender() {
    // Logic goes here
  }
}
