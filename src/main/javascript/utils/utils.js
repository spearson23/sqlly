import fs from 'fs';
import Loggerly from '../../../../../loggerly/src/main/javascript/loggerly';

const logger = Loggerly.getLogger('sqlly');

export default class Utils {
  static _deepAssign(dest, src) {
    if (Array.isArray(src)) {
      dest = dest || [];
      for (const key in src) {
        dest[key] = Utils._deepAssign(dest[key], src[key]);
      }
      return dest;
    } else if ((typeof src === 'object') && (src.__proto__ == Object.prototype)) {
      dest = dest || {};
      for (const key in src) {
        if (src.hasOwnProperty(key)) {
          dest[key] = Utils._deepAssign(dest[key], src[key]);
        }
      }
      return dest;
    } else {
      return src;
    }
  }
  static deepAssign(dest, ...srcs) {
    return srcs.reduce((target, src) => {
      return Utils._deepAssign(target, src);
    }, dest);
  }

  static loadJson(filename) {
    try {
      const string = fs.readFileSync(filename, 'utf8');
      if (string) {
        return JSON.parse(string);
      }
    } catch(error) {
      logger.warn("Sqlly: Failed to load config file (" + filename + "), using default config.");
    }
  }
}
