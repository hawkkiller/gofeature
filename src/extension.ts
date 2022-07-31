import * as _ from "lodash";

import { commands, ExtensionContext } from "vscode";
import {
  newFeature,
} from "./commands";

export function activate(_context: ExtensionContext) {

  _context.subscriptions.push(
    commands.registerCommand("extension.new-feature", newFeature),
  );
}
