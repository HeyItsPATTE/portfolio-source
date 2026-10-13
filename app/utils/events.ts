/**
 * A plain left click: no modifier keys, so the browser follows the link in this tab.
 * A click the router already handled (default prevented) still counts.
 */
export function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
}
