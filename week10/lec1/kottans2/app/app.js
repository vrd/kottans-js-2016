import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

let App;

window.people = [
      { id: 11, name: 'John', pokemonsIds: [1] },
      { id: 12, name: 'Andrey', pokemonsIds: [4] },
      { id: 13, name: 'Bort', pokemonsIds: [] }
    ];

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
