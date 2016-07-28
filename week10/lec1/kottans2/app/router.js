import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('people', {path: '/'}, function() {
    this.route('person', {path: ':person_name'});
  });
});

export default Router;
