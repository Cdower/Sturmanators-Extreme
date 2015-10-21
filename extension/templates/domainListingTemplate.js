/*
 * This is just a janky way of templating.
 * We're building an array of strings of HTML in Javascript so
 * that it is formatted a bit more nicely than a single
 * line of unreadable HTML. This is compressed back into
 * a single string of HTML in the .setTemplate() call.
 *
 * The <%= %> notation is to inject content into the
 * template when .render() is called. This is called ERB
 * syntax if you'd like to learn more about it.
 *
 */

domainListingTemplate = [
  "<li>",
  "<%= domain %>",
  "<div class='controls'>",
    "<span class='control-item control-item-productive'></span>",
    "<span class='control-item control-item-unknown'></span>",
    "<span class='control-item control-item-unproductive'></span>",
  "</div>",
  "</li>"
];
