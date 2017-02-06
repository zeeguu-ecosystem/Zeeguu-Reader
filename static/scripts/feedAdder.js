/* Script that allows the user to add a new feed to their feed list using
 * a HTML dialog window. */
var dialog = document.querySelector('dialog');
var showModalButton = document.querySelector('.show-modal');
if (! dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
}
showModalButton.addEventListener('click', function() {
  dialog.showModal();
});
dialog.querySelector('.close').addEventListener('click', function() {
  dialog.close();
});
