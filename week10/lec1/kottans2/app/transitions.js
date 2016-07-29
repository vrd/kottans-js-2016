export default function(){
  this.transition(
    this.toRoute('people.person'),
    this.use('toDown'),
    this.reverse('toUp')
  );
}
