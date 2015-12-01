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
  "<li id='uid' class='domain-listing'>",
  "<%= domain %>",
  "<div class='controls'>",
    "<span data-domain='<%= domain %>' class='control-item control-item-productive unchecked'></span>",
    "<span data-domain='<%= domain %>' class='control-item control-item-unknown'></span>",
    "<span data-domain='<%= domain %>' class='control-item control-item-unproductive unchecked'></span>",
  "</div>",
  "</li>"
];
