$( "#btnLabel" ).click(function() {
  //alert( "Handler for btnLabel .click() called." );
  $('#labelModal').modal('show');
});

$( "#btnCategory" ).click(function() {
  //alert( "Handler for btnCategory .click() called." );
  $('#categoryModal').modal('show');
});

$( "#btnSaveLabel" ).click(function() {
  alert( "Calling save label to server" );
  $('#labelModal').modal('hide');
});

$( "#btnSaveCategory" ).click(function() {
  alert( "Calling save category to server" );
  $('#categoryModal').modal('hide');
});