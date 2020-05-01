const fs = require('fs')
const mongoose = require('mongoose')

const typeMapper = {
  'Date':'mongoose.Schema.Types.Date',
  'String':'mongoose.Schema.Types.String',
  'ObjectId':'mongoose.Schema.Types.ObjectId',
  'Boolean':'mongoose.Schema.Types.Boolean',
  'Number':'mongoose.Schema.Types.Number'
}
const handleType = function(type){
  if(!type.includes('_')) return typeMapper[type]
  else{
    let [prefix,_type_] = type.split('_')
    console.log(prefix,_type_)
    return '"======"'
  }
}

//readin file as received user input
const data = JSON.parse(fs.readFileSync('./userinput.json',{encoding:'utf8'}))
//readin template
const modelTemp = fs.readFileSync('./mongodb/mongodb.template',{encoding:'utf8'})

data['Entities'].forEach(e => {
  let schemaName = e['name']
  let modelFileContent = modelTemp.replace(/{{SCHEMA_NAME}}/gi,schemaName).replace(/\r\n/gi,'\n')
  // console.log(modelFileContent)
  e['properties'].forEach(E => {
    modelFileContent = modelFileContent.replace(/{{PROPERTY_ENDPOINT}}/,`${E['name']}:${handleType(E['type'])},\n  {{PROPERTY_ENDPOINT}}`)
  })
  modelFileContent = modelFileContent.replace(/,\n  {{PROPERTY_ENDPOINT}}/,'')
  console.log(modelFileContent)
  fs.writeFileSync(`Models/${schemaName}Model.js`,modelFileContent,{encoding:'utf8'})
})
