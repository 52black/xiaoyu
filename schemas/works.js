//  作品表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var worksSchema = new Schema({
	user: {type:ObjectId, ref:'User'},
	worksid: String,
	title:String,
	abstract:String,
	explain:String,
	isOnly:{
		type:Boolean,
		default:false
	},
	tags:Array,
	looks:{
		type:Number,
		default:0
	},
	zan:{
		type:Number,
		default:0
	},
	zanlist:Array,
	keep:{
		type:Number,
		default:0
	},
	keeplist:Array,
	time:String,
	covers:String,
	meta:{
		createAt: {
			type:Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})
worksSchema.pre('save', function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}
	next();
})
worksSchema.statics = {
	findByuser:function(userid, cb){
		return this
		.find({user: userid})
		.exec(cb)
	},
	updateLooks:function(worksid, cb) {
		return this
		.update({_id: worksid},{$inc:{looks:1}})
		.exec(cb)
	},
	zanAddById: function(worksid, zanvalue, cb){
		return this
		.update({_id:worksid},{$inc:{zan:1},$push:{zanlist:zanvalue}})
		.exec(cb)
	},
	zanReduceById:function(worksid, zanvalue, cb){
		return this
		.update({_id:worksid},{$inc:{zan:-1},$pull:{zanlist:zanvalue}})
		.exec(cb)
	},
	keepAddById: function(worksid, kvalue, cb){
		return this
		.update({_id:worksid},{$inc:{keep:1}, $push:{keeplist:kvalue}})
		.exec(cb)
	},
	keepReduceById:function(worksid, kvalue, cb){
		return this
		.update({_id:worksid},{$inc:{keep:-1}, $pull:{keeplist:kvalue}})
		.exec(cb)
	},
	findCount:function(cb){
		return this
		.find({}).count()
		.exec(cb)
	},
	updateByWid:function(id,msg, cb) {
		return this
		.update({_id: id},{$set:{
			worksid:msg.worksid,
			title:msg.title,
			abstract:msg.abstract,
			explain:msg.explain,
			isOnly:msg.isOnly,
			tags:msg.tags,
			covers:msg.covers
		}})
		.exec(cb)
	}
}
module.exports = worksSchema;
