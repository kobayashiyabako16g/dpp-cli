// Full-featured TypeScript configuration for dpp.vim
// Includes extensions, lazy loading, and common plugins
// Plugins are defined in dpp.toml (see full-toml.toml)

import type {
  ContextBuilder,
  ExtOptions,
  Plugin,
} from "jsr:@shougo/dpp-vim@~4.5.0/types";
import type { Protocol } from "jsr:@shougo/dpp-vim@~4.5.0/protocol";
import type { Dpp } from "jsr:@shougo/dpp-vim@~4.5.0/dpp";
import { mergeFtplugins } from "jsr:@shougo/dpp-vim@~4.5.0/utils";
import {
  BaseConfig,
  type ConfigReturn,
  type MultipleHook,
} from "jsr:@shougo/dpp-vim@~4.5.0/config";
import type {
  Ext as TomlExt,
  Params as TomlParams,
} from "jsr:@shougo/dpp-ext-toml@~1.3.0";
import type {
  Ext as LazyExt,
  LazyMakeStateResult,
  Params as LazyParams,
} from "jsr:@shougo/dpp-ext-lazy@~1.5.0";

import type { Denops } from "jsr:@denops/std@~7.6.0";

const BASE_PATH = Deno.env.get("HOME") + "/.config/nvim";

export class Config extends BaseConfig {
  override async config(args: {
    denops: Denops;
    contextBuilder: ContextBuilder;
    basePath: string;
    dpp: Dpp;
  }): Promise<ConfigReturn> {
    args.contextBuilder.setGlobal({
      protocols: ["git"],
    });

    const [context, options] = await args.contextBuilder.get(args.denops);
    const protocols = await args.denops.dispatcher.getProtocols() as Record<
      string,
      Protocol
    >;

    const recordPlugins: Record<string, Plugin> = {};
    const ftplugins: Record<string, string> = {};
    const hooksFiles: string[] = [];
    let multipleHooks: MultipleHook[] = [];

    // Load toml plugins
    const [tomlExt, tomlOptions, tomlParams]: [
      TomlExt | undefined,
      ExtOptions,
      TomlParams,
    ] = await args.denops.dispatcher.getExt(
      "toml",
    ) as [TomlExt | undefined, ExtOptions, TomlParams];

    if (tomlExt) {
      const action = tomlExt.actions.load;
      const toml = await action.callback({
        denops: args.denops,
        context,
        options,
        protocols,
        extOptions: tomlOptions,
        extParams: tomlParams,
        actionParams: {
          path: `${BASE_PATH}/dpp.toml`,
          options: {
            lazy: false,
          },
        },
      });

      for (const plugin of toml.plugins ?? []) {
        recordPlugins[plugin.name] = plugin;
      }

      if (toml.ftplugins) {
        mergeFtplugins(ftplugins, toml.ftplugins);
      }

      if (toml.multiple_hooks) {
        multipleHooks = multipleHooks.concat(toml.multiple_hooks);
      }

      if (toml.hooks_file) {
        hooksFiles.push(toml.hooks_file);
      }
    }

    // Lazy load plugins
    const [lazyExt, lazyOptions, lazyParams]: [
      LazyExt | undefined,
      ExtOptions,
      LazyParams,
    ] = await args.denops.dispatcher.getExt(
      "lazy",
    ) as [LazyExt | undefined, ExtOptions, LazyParams];

    let lazyResult: LazyMakeStateResult | undefined = undefined;
    if (lazyExt) {
      const action = lazyExt.actions.makeState;
      lazyResult = await action.callback({
        denops: args.denops,
        context,
        options,
        protocols,
        extOptions: lazyOptions,
        extParams: lazyParams,
        actionParams: {
          plugins: Object.values(recordPlugins),
        },
      });
    }

    return {
      checkFiles: lazyResult?.stateLines.length
        ? lazyResult.stateLines
        : undefined,
      ftplugins,
      hooksFiles,
      multipleHooks,
      plugins: lazyResult?.plugins ?? Object.values(recordPlugins),
      stateLines: lazyResult?.stateLines,
    };
  }
}
