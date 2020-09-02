import {OverrideProvider} from "@tsed/di";
import * as Express from "express";
import {PlatformStaticsOptions} from "../../config/interfaces/PlatformStaticsSettings";
import {PlatformApplication} from "../../platform/services/PlatformApplication";
import {PlatformHandler} from "../../platform/services/PlatformHandler";
import {staticsMiddleware} from "../middlewares/staticsMiddleware";

declare global {
  namespace TsED {
    export interface Application extends Express.Application {}

    export interface StaticsOptions {
      /**
       * Enable or disable setting Cache-Control response header, defaults to true.
       * Disabling this will ignore the immutable and maxAge options.
       */
      cacheControl?: boolean;

      /**
       * Set how "dotfiles" are treated when encountered. A dotfile is a file or directory that begins with a dot (".").
       * Note this check is done on the path itself without checking if the path actually exists on the disk.
       * If root is specified, only the dotfiles above the root are checked (i.e. the root itself can be within a dotfile when when set to "deny").
       * The default value is 'ignore'.
       * 'allow' No special treatment for dotfiles
       * 'deny' Send a 403 for any request for a dotfile
       * 'ignore' Pretend like the dotfile does not exist and call next()
       */
      dotfiles?: string;

      /**
       * Enable or disable etag generation, defaults to true.
       */
      etag?: boolean;

      /**
       * Set file extension fallbacks. When set, if a file is not found, the given extensions will be added to the file name and search for.
       * The first that exists will be served. Example: ['html', 'htm'].
       * The default value is false.
       */
      extensions?: string[] | false;

      /**
       * Let client errors fall-through as unhandled requests, otherwise forward a client error.
       * The default value is true.
       */
      fallthrough?: boolean;

      /**
       * Enable or disable the immutable directive in the Cache-Control response header.
       * If enabled, the maxAge option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the maxAge option to check if the file has changed.
       */
      immutable?: boolean;

      /**
       * By default this module will send "index.html" files in response to a request on a directory.
       * To disable this set false or to supply a new index pass a string or an array in preferred order.
       */
      index?: boolean | string | string[];

      /**
       * Enable or disable Last-Modified header, defaults to true. Uses the file system's last modified value.
       */
      lastModified?: boolean;

      /**
       * Provide a max-age in milliseconds for http caching, defaults to 0. This can also be a string accepted by the ms module.
       */
      maxAge?: number | string;

      /**
       * Redirect to trailing "/" when the pathname is a dir. Defaults to true.
       */
      redirect?: boolean;

      /**
       * Function to set custom headers on response. Alterations to the headers need to occur synchronously.
       * The function is called as fn(res, path, stat), where the arguments are:
       * res the response object
       * path the file path that is being sent
       * stat the stat object of the file that is being sent
       */
      setHeaders?: (res: Express.Response, path: string, stat: any) => any;
    }
  }
}

/**
 * @platform
 * @express
 */
@OverrideProvider(PlatformApplication)
export class PlatformExpressApplication extends PlatformApplication {
  constructor(platformHandler: PlatformHandler) {
    super(platformHandler);
    this.raw = Express();
  }

  statics(endpoint: string, options: PlatformStaticsOptions) {
    const {root, ...props} = options;

    this.use(endpoint, staticsMiddleware(root, props));

    return this;
  }
}
