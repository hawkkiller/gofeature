import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";
import cp = require('child_process');

import {
  InputBoxOptions,
  OpenDialogOptions,
  Uri,
  window,
  workspace,
} from "vscode";
import { existsSync, lstatSync, writeFile } from "fs";
import * as templates from "../templates";

export const newFeature = async (uri: Uri) => {
  const featureName = await promptForFeatureName();
  if (_.isNil(featureName) || featureName.trim() === "") {
    window.showErrorMessage("The feature name must not be empty");
    return;
  }

  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  const pascalCaseFeatureName = changeCase.pascalCase(featureName);
  try {
    await generateFeatureCode(featureName, targetDirectory);
    window.showInformationMessage(
      `Successfully Generated ${pascalCaseFeatureName} Feature`
    );
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

function promptForFeatureName(): Thenable<string | undefined> {
  const featureNamePromptOptions: InputBoxOptions = {
    prompt: "Feature Name",
    placeHolder: "feature_name",
  };
  return window.showInputBox(featureNamePromptOptions);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the bloc in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

async function generateFeatureCode(
  featureName: string,
  targetDirectory: string,
) {
  const featureDirectoryPath = `${targetDirectory}/${featureName}`;
  const pascalCaseFeatureName = changeCase.pascalCase(featureName);
  const folder = workspace.getWorkspaceFolder(Uri.file(featureDirectoryPath));
  let modName: string | null = null;
  const promise = new Promise<void>((resolve, reject) => {
    cp.exec(`cd ${folder?.uri.fsPath} && go mod edit -json | python3 -c "import sys, json; print(json.load(sys.stdin)['Module']['Path'])"`, (err, stdout, _) => {
      if (err) {
        console.log('Error reading go.mod: ' + err);
        window.showWarningMessage('Error reading go.mod: ' + err + ' (not a big problem, maybe python3 is not installed.)');
        reject(err);
        return
      }
      modName = stdout.trim();
      resolve();
    })
  },
  );

  await promise;
  
  await createDirectory(featureDirectoryPath);

  await createByTemplate(featureDirectoryPath, "db", templates.dbTemplate(pascalCaseFeatureName));
  await createByTemplate(featureDirectoryPath, "handlefunc", templates.handleFuncTemplate(pascalCaseFeatureName, modName));
  await createByTemplate(featureDirectoryPath, "init", templates.initTemplate(pascalCaseFeatureName, modName));
  await createByTemplate(featureDirectoryPath, "service", templates.serviceTemplate(pascalCaseFeatureName, modName));
  await createByTemplate(featureDirectoryPath, "model", templates.modelTemplate());
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!existsSync(targetDirectory)) {
      mkdirp(targetDirectory, (error) => {
        if (error) {
          return reject(error);
        }
      });
    }
    if (!existsSync(targetDirectory + '/handlefunc')) {
      mkdirp(targetDirectory + '/handlefunc', (error) => {
        if (error) {
          return reject(error);
        }
      })
    }
    if (!existsSync(targetDirectory + '/init')) {
      mkdirp(targetDirectory + '/init', (error) => {
        if (error) {
          return reject(error);
        }
      })
    }
    if (!existsSync(targetDirectory + '/service')) {
      mkdirp(targetDirectory + '/service', (error) => {
        if (error) {
          return reject(error);
        }
      })
    }
    if (!existsSync(targetDirectory + '/db')) {
      mkdirp(targetDirectory + '/db', (error) => {
        if (error) {
          return reject(error);
        }
      })
    }
    if (!existsSync(targetDirectory + '/model')) {
      mkdirp(targetDirectory + '/model', (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      })
    }
  });
}

function createByTemplate(
  targetDirectory: string,
  pkg: string,
  template: string,
) {
  const targetPath = `${targetDirectory}/${pkg}/${pkg}.go`;
  if (existsSync(targetPath)) {
    throw Error(`${targetPath} already exists`);
  }

  return new Promise<void>(async (resolve, reject) => {
    writeFile(targetPath, template, "utf8", (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  }
  );
}
