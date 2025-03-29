import FormData from "form-data";
import fetch from "node-fetch";
export function updateNodeGlobalVars() {
  global.FormData = FormData;
  global.window = {
    fetch: fetch,
    dispatchEvent: () => {},
  };
  global.CustomEvent = function CustomEvent() {
    return;
  };
}
