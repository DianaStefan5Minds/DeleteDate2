/**
 * This simple G Suite add-on let's the user add a property 
 * called delete date to selcted files. If the date of theses files is due, 
 * the files are added to a list of manually to be delted files.
 * This tool is beeing created in the context of DSGVO. 
 */

/**
 * The maximum number of characters that can fit in the cat image.
 */
var MAX_MESSAGE_LENGTH = 40;

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user, if nothing is selected.
 */
function onHomepage(e) {
  console.log(e);
  var hour = Number(Utilities.formatDate(new Date(), e.userTimezone.id, 'H'));
  var message;
  if (hour >= 6 && hour < 12) {
    message = 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    message = 'Good afternoon';
  } else {
    message = 'Good night';
  }
  message += ' ' + e.hostApp;
  return createCard(message, false);
}


/**
 * Creates a card with with the deleteDate options.
 * @param {String} text The text to be shown. Either an instruction or success or failure message.
 * @param {Boolean} isAtLeastOneFileSelected False if no file has been selected, to be deleted.
 * @return {CardService.Card} The assembled card.
 */
function createCard(text, isAtLeastOneFileSelected) {
  // Explicitly set the value of isAtLeastOneFileSelected as false if null or undefined.
  if (!isAtLeastOneFileSelected) {
    isAtLeastOneFileSelected = false;
  }

  // Show a small instruction.
  var instructionText = CardService.newTextParagraph()
  .setText("This is a text paragraph widget. Multiple lines are allowed if needed. Here shall be the instruction.");

  // create a date picker
  var dateTimeInput = CardService.newDatePicker()
  .setTitle("Löschdatum festsetzen")
  .setFieldName("deletion_date");
    
  // Create a button that sets a delete date to the choosen file
  var actionAdd = CardService.newAction()
      .setFunctionName('addDeleteDate')
      .setParameters({text: text, isAtLeastOneFileSelected: isAtLeastOneFileSelected.toString()});
  var buttonAdd = CardService.newTextButton()
      .setText('Hinzufügen')
      .setOnClickAction(actionAdd)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  // Create a button that removes the delete date from the choosen file:
  var actionRemove = CardService.newAction()
    .setFunctionName('removeDeleteDate')
    .setParameters({text: text, isAtLeastOneFileSelected: isAtLeastOneFileSelected.toString()});
  var buttonRemove = CardService.newTextButton()
    .setText('Entfernen')
    .setOnClickAction(actionRemove)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  
  var action = CardService.newAction()
      .setFunctionName('notificationCallback');
  var actionButton = CardService.newTextButton()
      .setText('Create notification')
      .setOnClickAction(action);
  
  
  var buttonSet = CardService.newButtonSet()
  .addButton(buttonAdd)
  .addButton(buttonRemove)
  .addButton(actionButton);

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
    .addWidget(instructionText)
    .addWidget(dateTimeInput)
    .addWidget(buttonSet);

  var card = CardService.newCardBuilder()
      .addSection(section)

  return card.build();
}

/**
 * Callback for the "Change cat" button.
 * @param {Object} e The event object, documented {@link
 *     https://developers.google.com/gmail/add-ons/concepts/actions#action_event_objects
 *     here}.
 * @return {CardService.ActionResponse} The action response to apply.
 */
function onChangeCat(e) {
  console.log(e);
  // Get the text that was shown in the current cat image. This was passed as a
  // parameter on the Action set for the button.
  var text = e.parameters.text;

  // The isAtLeastOneFileSelected parameter is passed as a string, so convert to a Boolean.
  var isAtLeastOneFileSelected = e.parameters.isAtLeastOneFileSelected === 'true';

  // Create a new card with the same text.
  var card = createCatCard(text, isAtLeastOneFileSelected);

  // Create an action response that instructs the add-on to replace
  // the current card with the new one.
  var navigation = CardService.newNavigation()
      .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
  return actionResponse.build();
}

/**
 * Callback fot the "80 Tage" button.
 */
function on80days(e) {
  console.log(e);
  var text = e.parameters.text;
  var isAtLeastOneFileSelected = e.paramerts.isAtLeastOneFileSelected === 'true';
  
  var card = createCalculatedCard(text, startDate, days, isAtLeastOneFileSelected);
  var navigation = CardService.newNavigation()
  .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
  .setNavigation(navigation);
  return actionResponse.build();
}


/**
 * Truncate a message to fit in the cat image.
 * @param {string} message The message to truncate.
 * @return {string} The truncated message.
 */
function truncate(message) {
  if (message.length > MAX_MESSAGE_LENGTH) {
    message = message.slice(0, MAX_MESSAGE_LENGTH);
    message = message.slice(0, message.lastIndexOf(' ')) + '...';
  }
  return message;
}




function notificationCallback() {
  return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
          .setText("Some info to display to user"))
      .build();
    }