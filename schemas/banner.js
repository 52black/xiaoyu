// 首页轮播图片表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


var bannerSchema = new Schema({
	title:String,
	src:String,
	url:String
})

bannerSchema.statics = {
	updateBanner:function(bannerid,imgvalue, cb){
		return this
		.update({_id:bannerid},{$push:{banner:imgvalue}})
		.exec(cb)
	},
	changeBanner:function(bannerid,bannerval,cb){
		return this
		.update({_id:bannerid},{$set:{
			'title':bannerval.title,
			'src':bannerval.src,
			'url':bannerval.url
		}})
		.exec(cb)
	}

}
module.exports = bannerSchema;