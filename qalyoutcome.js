const ptlevels = require('./ptlvlConverter')
const lookupindexer = require('./lookupIndexer')
const csvValue = require('./csvlookup')
const fileIndexer = require('./fileIndexer')

function qalyoutcome(path, config, inputs){
  var features = inputFeatures(config, inputs)
  var output = {}
  var ptlvl = ptlevels(config, features)
  let fileIndex = fileIndexer(config, inputs.features)
  var luindex = lookupindexer(path, config, fileIndex, ptlvl)

  if(Object.keys(luindex).length!=0){
    var result = csvValue(luindex.tableid, luindex.index)
    if(Object.keys(result).length!=0){
      config.outputs.forEach(function(e){
        let field = e.field.trim().toLowerCase()
        let outputObj ={}
        outputObj.id = e.id
        outputObj.field = field
        outputObj.service = config.id
        outputObj.qaly = {}
        outputObj.qaly.gain = result[field]
        outputObj.data_source = {}
        outputObj.data_source.updateDate = config.updatedOn
        outputObj.data_source.type = config.datatype
        if(process.env.DEBUG){
          outputObj.data_source.debugentry=result
        }
        output[e.id]= outputObj
      })
    } else {
      output[config.id]={}
      output[config.id].id=config.id
      output[config.id].error = "Entry not found in the look up table."
    }
  } else {
    output[config.id]={}
    output[config.id].id=config.id
    output[config.id].error = "No look up table available."
  }
  return output
}

function inputFeatures(config, pt){
  var features = {}
  Object.keys(config.columns).forEach(function(key){
    features[key]=pt.features[key]
  })
  return features
}

module.exports= qalyoutcome
