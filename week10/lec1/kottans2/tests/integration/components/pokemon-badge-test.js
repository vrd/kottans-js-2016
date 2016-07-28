import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pokemon-badge', 'Integration | Component | pokemon badge', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{pokemon-badge}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#pokemon-badge}}
      template block text
    {{/pokemon-badge}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
