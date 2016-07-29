import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    let kotan = null;
    return Promise.resolve(window.people.filter(p => p.name === params.person_name)[0])
    .then(person => {
      kotan = person;
      return Promise.all(kotan.pokemonsIds.map(id => $.getJSON('https://pokeapi.co/api/v1/pokemon/' + id)));
    })
    .then(pokemons => {
      return {kotan, pokemons};
    })
    .then(obj => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {resolve(obj)}, 1000);
      })
    });
    //return {kotan: {name: params.person_name}, pokemons: [{name: 'dfdfd'}, {name: 'werwerwer'}]}
  }
});

