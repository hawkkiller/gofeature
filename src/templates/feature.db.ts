export const dbTemplate = (featureName: string) => {
    return `package db

type ${featureName}Storage interface {
}

type db struct {
}

func New${featureName}Storage() ${featureName}Storage {
   return &db{}
}`
}