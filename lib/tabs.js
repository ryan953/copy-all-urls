/**
 * Tab querying + opening. Wraps the `chrome.tabs`/`chrome.windows` calls the
 * copy and paste flows need.
 */

// Return the tabs to copy, honouring the walk-all-windows and highlighted-only settings.
export async function queryTabs(settings) {
  const query = {};
  if (!settings.walk_all_windows) {
    const win = await chrome.windows.getCurrent();
    query.windowId = win.id;
  }
  let tabs = await chrome.tabs.query(query);
  if (settings.highlighted_tab_only) {
    tabs = tabs.filter((t) => t.highlighted);
  }
  return tabs;
}

// Open each URL in a new tab. Invalid URLs are skipped rather than aborting the batch.
export async function openUrls(urls) {
  let opened = 0;
  for (const url of urls) {
    try {
      await chrome.tabs.create({ url });
      opened += 1;
    } catch {
      // e.g. a malformed URL from the clipboard — ignore and keep going.
    }
  }
  return opened;
}
