const fs = require('fs')
const unzipper = require('unzipper')

const typeMapper = {
  'Date': 'mongoose.Schema.Types.Date',
  'String': 'mongoose.Schema.Types.String',
  'ObjectId': 'mongoose.Schema.Types.ObjectId',
  'Boolean': 'mongoose.Schema.Types.Boolean',
  'Number': 'mongoose.Schema.Types.Number'
}
const handleType = function (type) {
  if (!type.includes('_')) return typeMapper[type]
  else {
    let [prefix, _type_] = type.split('_')
    console.log(prefix, _type_)
    return '"======"'
  }
}

//readin file as received user input
const userInput = require('./userinput.json')
//readin template
const modelTemp = fs.readFileSync('./Templates/mongodb.template', { encoding: 'utf8' })
const routeTemp = fs.readFileSync('./Templates/route.template', { encoding: 'utf8' })

async function main() {

  // try {
  //   await new Promise((resolve,reject)=>{
  //     fs.createReadStream('./express_template.zip')
  //       .pipe(unzipper.Extract({ path: `${userInput.ProjectName}` }))
  //       .on('close',()=>{resolve()})
  //       .on('error',(err)=>{reject(err)})
  //   })
  // } catch (error) {
  //   console.error('extract express template failed with error: ',error.message)
  // }
  await fs.createReadStream('./express_template.zip')
          .pipe(unzipper.Extract({ path: `${userInput.ProjectName}` }))
          .promise()
  
  //model name records
  const modelNames = []

  userInput.Entities.forEach(e => {
    let schemaName = e['name'].replace(/^\S/, s => s.toUpperCase()) // change first letter to uppercase
    modelNames.push(schemaName)

    //generate model file
    let modelFileContent = modelTemp.replace(/{{SCHEMA_NAME}}/gi, schemaName).replace(/\r\n/gi, '\n')
    e['properties'].forEach(E => {
      modelFileContent = modelFileContent.replace(/{{PROPERTY_ENDPOINT}}/, `${E['name']}:${handleType(E['type'])},\n  {{PROPERTY_ENDPOINT}}`)
    })
    modelFileContent = modelFileContent.replace(/,\n  {{PROPERTY_ENDPOINT}}/, '')
    fs.writeFileSync(`${userInput.ProjectName}/models/${schemaName}Model.js`, modelFileContent, { encoding: 'utf8' })
    console.log(`${schemaName} Model generated.`)

    //generate route file
    let routeFileContent = routeTemp.replace(/{{MODELNAME}}/gi, schemaName).replace(/\r\n/gi, '\n')
    fs.writeFileSync(`${userInput.ProjectName}/routes/${schemaName}Router.js`, routeFileContent, { encoding: 'utf8' })
    console.log(`${schemaName} Router generated.`)
  })

  //generate models/index.js
  let modelIndexContent = ''
  modelNames.forEach(e => {
    modelIndexContent += `const ${e}Model = require('./${e}Model')\n`
  })
  modelIndexContent += `\nmodule.exports = {${modelNames.map(name => `${name}Model`).join(',')}}\n`
  fs.writeFileSync(`${userInput.ProjectName}/models/index.js`, modelIndexContent, { encoding: 'utf8' })
  console.log('model index generated.')

  //generate routes/api.index.js
  let apiIndexContent = `const express = require('express')
const router = express.Router()
{{REQUIRE_ENDPOINT}}

{{USE_ENDPOINT}}

module.exports = router`
  modelNames.forEach(e => {
    apiIndexContent = apiIndexContent.replace(/{{REQUIRE_ENDPOINT}}/, `const ${e}Router = require('./${e}Router')\n{{REQUIRE_ENDPOINT}}`)
    apiIndexContent = apiIndexContent.replace(/{{USE_ENDPOINT}}/, `router.use('/${e.toLowerCase()}/', ${e}Router)\n{{USE_ENDPOINT}}`)
  })
  apiIndexContent = apiIndexContent.replace(/{{REQUIRE_ENDPOINT}}/, '')
  apiIndexContent = apiIndexContent.replace(/{{USE_ENDPOINT}}/, '')
  fs.writeFileSync(`${userInput.ProjectName}/routes/api.index.js`, apiIndexContent, { encoding: 'utf8' })
  console.log('api index file generated.')

  //generate config/default.json
  const defaultConfig = {
    "Resources": userInput.Resource,
    "DB": userInput.DB
  }
  fs.writeFileSync(`${userInput.ProjectName}/config/default.json`, JSON.stringify(defaultConfig), { encoding: 'utf8' })
  console.log('config file generated.')

  //modify package name in package.json
  let packageJson = require(`./${userInput.ProjectName}/package.json`)
  packageJson.name = userInput.ProjectName.toLowerCase()
  fs.writeFileSync(`./${userInput.ProjectName}/package.json`, JSON.stringify(packageJson), { encoding: 'utf8' })
  console.log('package.json modified.')

  console.log('next step:\n')
  console.log(`cd ${userInput.ProjectName}`)
  console.log('npm i')
  console.log('npm start')

}
main()