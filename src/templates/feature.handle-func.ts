import { snakeCase } from "change-case";

const imports = (modName: string | null, featureName: string) => {
   if (modName) {
      const featureFolder = `${modName}/app/feature/${featureName}`
      return `
import (
   "net/http"

   "${featureFolder}/service"
)`
   }
   return '';
}


export const handleFuncTemplate = (featureName: string, modName: string | null) => {
   return `package handlefunc

${imports(modName, snakeCase(featureName))}

type ${featureName}HandleFunc interface {
   Example(w http.ResponseWriter, r *http.Request)
}

type handleFunc struct {
   service service.${featureName}Service
}

func New${featureName}HandleFunc(service service.${featureName}Service) ${featureName}HandleFunc {
   return &handleFunc{service: service}
}

// Example implements HeyhoHandleFunc.
func (*handleFunc) Example(w http.ResponseWriter, r *http.Request) {
	panic("unimplemented")
}`

}