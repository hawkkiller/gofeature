import { snakeCase } from "change-case";

const imports = (modName: string | null, featureName: string) => {
    if (modName) {
        const featureFolder = `${modName}/src/feature/${featureName}`
        return `
import (
    "${featureFolder}/db"
)
`
    }
    return '';
}


export const serviceTemplate = (featureName: string, modName: string | null) => {
    return `package service

${imports(modName, snakeCase(featureName))}

type ${featureName}Service interface {
}

type service struct {
    storage db.${featureName}Storage
}

func New${featureName}Service(storage db.${featureName}Storage) ${featureName}Service {
   return &service{storage: storage}
}`
}