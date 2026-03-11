import { translate } from "../../../i18n.js";

export function interpolateTemplate(template, params) {
  if (!params) return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, name) => {
    const value = params[name];
    return value !== undefined && value !== null ? String(value) : "";
  });
}

export function tr(key, fallback, params) {
  return interpolateTemplate(translate(fallback, key), params);
}

export const i18n = tr;
