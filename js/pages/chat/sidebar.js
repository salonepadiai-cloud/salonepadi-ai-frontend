/*
|--------------------------------------------------------------------------
| SIDEBAR FEATURE
|--------------------------------------------------------------------------
|
| Base sidebar behaviour is available here so future sidebar upgrades can
| be made without touching the master controller.
|--------------------------------------------------------------------------
*/

export function init(context) {
  const {
    elements,
    actions
  } = context;

  const {
    root
  } = elements || {};

  if (!root) {
    return;
  }

  return () => {};
}
