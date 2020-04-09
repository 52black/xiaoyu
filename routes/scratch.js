const express = require('express');
const User = require('../models/user');
const Unrel = require('../models/unreleased');
const Works = require('../models/works');
const path = require('path');
const fs = require('fs');
const multer  = require('multer');
const router = express.Router();

let pagetitle = 'Scratch3.0创作 - 小幽编程';
function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString().substring(1);
    }
    return (S4()+S4());
}

/* GET scratch 3.0 page. */
router.get('/', function(req, res, next) {
	let _user = req.session.user;
	if(_user){
	res.locals.user = _user;
	let userId = res.locals.user._id;
	Unrel.find({user: userId}).sort({'meta.updateAt':-1}).exec(function(err, worksdata){
			worksdata = JSON.stringify(worksdata)
			res.render('scratch', { 
				title: pagetitle,
				worksdata: worksdata
				});
		})
	}else{
		res.render('scratch', { 
		title: pagetitle,
		worksdata: ''
		});
	}
});

// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var save_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/unreleased/'+file.fieldname+'/')
  },
  filename: function (req, file, cb) {
    cb(null,  guid() + Date.now())
  }
})

// 创建 multer 对象
var savefile = multer({ storage: save_storage });
var save_file = savefile.fields([{ name: 'scratch', maxCount: 1 }, { name: 'covers', maxCount: 1 }])

/* POST 保存文件接口 A. */
router.post('/files/savenew', save_file,function(req, res, next) {
	let _user = req.session.user;
	let files = req.files;
	const file_name = files.scratch[0].filename;
	const covers = files.covers[0].filename;
	const user_id = req.body.userid;
	const user_file_name = req.body.filenames;
	if(user_id && user_id !=='undefined' && user_file_name){
		let new_file_msg = new Unrel({
			title: user_file_name,
			user:user_id,
			localsname:file_name,
			covers:covers
		})
		new_file_msg.save(function(err, file_new){
			if(err){console.log(err)}
			res.send({
				status:'success',
				newfile:file_new,
				msg:'保存成功'
			})
		})
	}else{
		fs.unlink('./public/unreleased/scratch/'+ file_name, function (err) {
			if (err){
				console.log(err)
			}
		})
		res.send({
			status:'fail',
			msg:'请先登录'
		})
	}
});

/* POST 保存文件接口 B. */
router.post('/files/saveold',save_file,function(req, res, next) {
	let files = req.files;
	const file_name = files.scratch[0].filename;
	const covers = files.covers[0].filename;
	const locals_id = req.body.filelists_localsid;
	const user_file_name = req.body.filelists_title;
	const local_file_name = req.body.filelists_local;
	const local_covers_name = req.body.filelists_covers;
	if(locals_id && user_file_name && local_file_name){
		Unrel.updateById(locals_id,user_file_name,file_name,covers, function(err, file_old){
			if(err){console.log(err)}
			res.send({
				status:'success',
				newlocals:{
					title: user_file_name,
					localsname: file_name
				},
				msg:'保存成功'
			})
			fs.unlink('./public/unreleased/scratch/'+ local_file_name, function (err) {
				if (err){
					console.log(err)
				}
			})
			fs.unlink('./public/unreleased/covers/'+ local_covers_name, function (err) {
				if (err){
					console.log(err)
				}
			})
		})
		
	}else{
		res.send({
			status:'fail',
			msg:'请先登录'
		})
	}
});

var rel_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/released/'+file.fieldname+'/')
  },
  filename: function (req, file, cb) {
    cb(null,  guid() + Date.now())
  }
})
// 创建 multer 对象
var relfile = multer({ storage: rel_storage });
var released_file = relfile.fields([{ name: 'scratch', maxCount: 1 }, { name: 'covers', maxCount: 1 }])
/* POST 发布作品接口 */
router.post('/files/released', released_file,function(req, res, next) {
	let _user = req.session.user;
	let files = req.files;
	const file_name = files.scratch[0].filename;
	const userid = req.body.userid;
	const filetitle = req.body.filetitle;
	const fileabstract = req.body.fileabstract
	const fileexplain = req.body.fileexplain;
	const tags = req.body.tags;
	let fileonly = req.body.fileonly;
	if(fileonly == 'false'){
		fileonly = false;
	}else{
		fileonly = true
	};
	console.log(fileonly)
	const localsid = req.body.localsid;
	const covers = files.covers[0].filename;
	const oldwid = req.body.oldwid;
	Works.findOne({_id:oldwid}).exec(function(err,work_msg){
		if(oldwid && work_msg && work_msg.user == userid){
			if(userid && filetitle && fileabstract){
				let worksmsg = {
					worksid:file_name,
					title:filetitle,
					abstract:fileabstract,
					explain:fileexplain,
					isOnly:fileonly,
					tags:tags.split(','),
					covers:covers
				}
				Works.updateByWid(oldwid,worksmsg,function(err){
					if(err){console.log(err)}
					res.send({
						status:'success',
						worksid:oldwid,
						msg:'发布成功'
					})
				})
			}else{
				res.send({
					status:'fail',
					msg:'请先登录'
				})
			}
		}else{
			if(userid && filetitle && fileabstract){
				let worksmsg = new Works({
					user:userid,
					worksid:file_name,
					title:filetitle,
					abstract:fileabstract,
					explain:fileexplain,
					isOnly:fileonly,
					tags:tags.split(','),
					covers:covers
				})
				worksmsg.save(function(err, works_new){
					if(err){console.log(err)}
					res.send({
						status:'success',
						worksid:works_new._id,
						msg:'发布成功'
					})
					//删除
					if(localsid){
						Unrel.remove({_id:localsid}).exec(function(err){
							if(err){console.log(err)}
						})
					}
				})
			}else{
				res.send({
					status:'fail',
					msg:'请先登录'
				})
			}
		}
	})
	
});

/* POST download listing. */
router.post('/loadfiles', function(req, res, next) {
	const fileId = req.body.fileid;
	if(fileId){
		res.sendFile(path.join(__dirname, '../public/unreleased/scratch/', fileId));
	}else{
		res.send({
			status:'fail'
		})
	}
});

router.get('/downloads', function(req, res, next) {
	const fileId = req.query.fileid;
	if(fileId){
		res.download('public/unreleased/scratch/'+fileId, fileId);
	}else{
		res.send({
			status:'fail'
		})
	}
});

router.get('/download/released', function(req, res, next) {
	const fileId = req.query.fileid;
	if(fileId){
		res.download('public/released/scratch/'+fileId, fileId);
	}else{
		res.send({
			status:'fail'
		})
	}
});
router.get('/download/released/:id', function(req, res, next) {
	const fileId = req.params.id;
	if(fileId){
		res.download('public/released/scratch/'+fileId, fileId);
	}else{
		res.send({
			status:'fail'
		})
	}
});
router.get('/loadReleaseMsg/:id', function(req, res, next) {
	const fileId = req.params.id;
	if(fileId){
		Works.find({worksid: fileId}).exec(function(err, worksdata){
	    res.send({
				status:'success',
				msg:worksdata[0]
			})
	  })
	}else{
		res.send({
			status:'fail'
		})
	}
});
module.exports = router;
