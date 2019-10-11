var mongoose = require('mongoose');
var worksclassifySchema = require('../schemas/works_classify');
var WorksClassify = mongoose.model('WorksClassify', worksclassifySchema)
module.exports = WorksClassify
