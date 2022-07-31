import { snakeCase } from "change-case";

const imports = (modName: string | null, featureName: string) => {
    if (modName) {
        const featureFolder = `${modName}/app/feature/${featureName}`
        return `
import (
    coreModel "${modName}/app/core/model"
    "log"
    "${featureFolder}/handlefunc"
    "${featureFolder}/service"
    "${featureFolder}/db"
)`
    }
    return '';
}

export const initTemplate = (featureName: string, modName: string | null) => {
    return `package init
${imports(modName, snakeCase(featureName))}

// Initialize ${featureName}.
func Init(model *coreModel.InitModel) {
    log.Print("Initialize ${featureName}")
    storage := db.New${featureName}Storage()

    service := service.New${featureName}Service(storage)

    handleFunc := handlefunc.New${featureName}HandleFunc(service)

    model.Mux.HandleFunc("/example", handleFunc.Example)
}
    
`
}