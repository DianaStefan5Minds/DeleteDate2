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
  return createCatCard(message, true);
}

/**
 * Creates a card with an image of a cat, overlayed with the text.
 * @param {String} text The text to overlay on the image.
 * @param {Boolean} isHomepage True if the card created here is a homepage;
 *      false otherwise. Defaults to false.
 * @return {CardService.Card} The assembled card.
 */
function createCatCard(text, isHomepage) {
  // Explicitly set the value of isHomepage as false if null or undefined.
  if (!isHomepage) {
    isHomepage = false;
  }

  // Use the "Cat as a service" API to get the cat image. Add a "time" URL
  // parameter to act as a cache buster.
  var now = new Date();
  // Replace formward slashes in the text, as they break the CataaS API.
  var caption = text.replace(/\//g, ' ');
  var imageUrl =
      Utilities.formatString('https://cataas.com/cat/says/%s?time=%s',
          encodeURIComponent(caption), now.getTime());
  var image = CardService.newImage()
      .setImageUrl(imageUrl)
      .setAltText('Meow')

  // Create a button that changes the cat image when pressed.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
      .setFunctionName('onChangeCat')
      .setParameters({text: text, isHomepage: isHomepage.toString()});
  var button = CardService.newTextButton()
      .setText('Change cat')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

      // create a date picker
  var dateTimeInput = CardService.newDatePicker()
  .setTitle("Löschdatum festsetzen")
  .setFieldName("deletion_date");

// create buttons with default deletion dates
var action80d = CardService.newAction()
  .setFunctionName('on80days')
  .setParameters({text: "80 Tage", isHomepage: isHomepage.toString()});
var button80d = CardService.newTextButton()
  .setText('80 Tage')
  .setOnClickAction(action80d)
.setTextButtonStyle(CardService.TextButtonStyle.FILLED);

buttonSet.addButton(button80d);
  
// Create a button that sets a delete date to the choosen file
var actionAdd = CardService.newAction()
    .setFunctionName('addDeleteDate')
    .setParameters({text: text, isHomepage: isHomepage.toString()});
var buttonAdd = CardService.newTextButton()
    .setText('Löschdatum hinzufügen')
    .setOnClickAction(actionAdd)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
var buttonSetAdd = CardService.newButtonSet()
    .addButton(buttonAdd);

// Create a button that sets a delete date to the choosen file
var actionRemove = CardService.newAction()
  .setFunctionName('removeDeleteDate')
  .setParameters({text: text, isHomepage: isHomepage.toString()});
var buttonRemove = CardService.newTextButton()
  .setText('Löschdatum hinzufügen')
  .setOnClickAction(actionRemove)
  .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
var buttonSetRemove = CardService.newButtonSet()
  .addButton(buttonRemove);

// Create a footer to be shown at the bottom.
var footer = CardService.newFixedFooter()
    .setPrimaryButton(CardService.newTextButton()
        .setText('Powered by cataas.com')
        .setOpenLink(CardService.newOpenLink()
            .setUrl('https://cataas.com')));

// Assemble the widgets and return the card.
var section = CardService.newCardSection()
    .addWidget(image)
    .addWidget(buttonSet)
    .addWidget(dateTimeInput)
    .addWidget(buttonSetAdd)
    .addWidget(buttonSetRemove);

var card = CardService.newCardBuilder()
    .addSection(section)
    .setFixedFooter(footer);

if (!isHomepage) {
  // Create the header shown when the card is minimized,
  // but only when this card is a contextual card. Peek headers
  // are never used by non-contexual cards like homepages.
  var peekHeader = CardService.newCardHeader()
    .setTitle('Contextual Cat')
    .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/pets_black_48dp.png')
    .setSubtitle(text);
  card.setPeekCardHeader(peekHeader)
}

return card.build();
}
function createCalculatedCard(text, startDate, days, isHomepage) {
  // Explicitly set the value of isHomepage as false if null or undefined.
  if (!isHomepage) {
    isHomepage = false;
  }

  if(!startDate) {
    startDate = new Date();
  }
   
  // Create a button that changes the cat image when pressed.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
      .setFunctionName('onChangeCat')
      .setParameters({text: text, isHomepage: isHomepage.toString()});
  var button = CardService.newTextButton()
      .setText('Change cat')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

  // create a date picker
  var dateTimeInput = CardService.newDatePicker()
      .setTitle("Löschdatum festsetzen")
      .setFieldName("deletion_date");
  
  // create buttons with default deletion dates
  var action80d = CardService.newAction()
      .setFunctionName('on80days')
      .setParameters({text: "80 Tage", isHomepage: isHomepage.toString()});
  var button80d = CardService.newTextButton()
      .setText('80 Tage')
      .setOnClickAction(action80d)
  .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  
  buttonSet.addButton(button80d);
  
  // Create a footer to be shown at the bottom.
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText('Powered by cataas.com')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('https://cataas.com')));

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
      .addWidget(image)
      .addWidget(dateTimeInput)
      .addWidget(buttonSet);
  var card = CardService.newCardBuilder()
      .addSection(section)
      .setFixedFooter(footer);

  if (!isHomepage) {
    // Create the header shown when the card is minimized,
    // but only when this card is a contextual card. Peek headers
    // are never used by non-contexual cards like homepages.
    var peekHeader = CardService.newCardHeader()
      .setTitle('Contextual Cat')
      .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/pets_black_48dp.png')
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }

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

  // The isHomepage parameter is passed as a string, so convert to a Boolean.
  var isHomepage = e.parameters.isHomepage === 'true';

  // Create a new card with the same text.
  var card = createCatCard(text, isHomepage);

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
  var isHomepage = e.paramerts.isHomepage === 'true';
  
  var card = createCalculatedCard(text, startDate, days, isHomepage);
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
