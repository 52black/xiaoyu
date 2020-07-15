const express = require('express');
const crypto = require('crypto');
const multer  = require('multer');
const Banner = require('../models/banner');
const Works = require('../models/works');
const User = require('../models/user');
const Suggest = require('../models/suggest');
const FeedBack = require('../models/feedback');
const Notice = require('../models/notice');
const Ucomment = require('../models/ucomment');
const Wcomment = require('../models/wcomment');
const UCommentip = require('../models/tip_comment_u');
const WCommentip = require('../models/tip_comment_w');
const Worktip = require('../models/tip_work');
const Usertip = require('../models/tip_user');
const Adminuser = require('../models/admin_user');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const moment = require('moment');
moment.locale('zh-CN');
// 登录
router.get('/login', function(req, res, next) {
    res.render('admin/login');
});
// 开设新管理员账号
router.get('/register', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    res.locals.admin = _admin
  }
  if(_admin){
    res.render('admin/register',{
      active:'register'
    });
  }else{
    res.redirect('/admin/login')
  }
  res.render('admin/register',{
    active:'register'
  });
});

/* GET 后台首页. */
router.get('/index', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    Works.find({}).count().exec(function(err , worknum){
      User.find({}).count().exec(function(err , usernum){
        Banner.find({}).exec(function(err , index_msg){
          if(err){console.log(err)}
          res.render('admin/index', {
            banners:index_msg,
            usernum:usernum,
            worknum:worknum,
            active:'index'
          });
        })
      })
    })
  }else{
    res.redirect('/admin/login')
  }
});

// 问题反馈
router.get('/feedback', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    FeedBack.find({}).sort({'meta.createAt': -1}).populate('user','_id nickname').exec(function(err, feedback){
      if(err){console.log(err)}
      res.render('admin/feedback',{
        active:'feedback',
        feedback:feedback
      })
    })
  }else{
    res.redirect('/admin/login')
  }
});
// 意见反馈
router.get('/suggest', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    Suggest.find({}).sort({'meta.createAt': -1}).populate('user','_id nickname').exec(function(err, suggest){
      if(err){console.log(err)}
      res.render('admin/suggest',{
        active:'suggest',
        suggest:suggest
      })
    })
  }else{
    res.redirect('/admin/login')
  }
});

// 搜索用户
router.get('/searchuser', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    res.render('admin/search_user',{
      active:'searchuser'
    })
  }else{
    res.redirect('/admin/login')
  }
});


/* GET 所有用户. */
router.get('/users/:page', function(req, res, next) {
  let _admin = req.session.admin;
  let pagenum = req.params.page;
  if(!pagenum){
    pagenum = 1
  }
  pagenum = parseInt(pagenum);
  var reg = /^[0-9]*$/;
  if(_admin && reg.test(pagenum)){
    User.countDocuments({}).exec(function(err, pagecount){
      if(err) console.log(err)
      let _pagenum = (parseInt(pagenum)-1)*40;
      if(_pagenum < 0 || _pagenum > pagecount){
        _pagenum = 0
      }
      User.find({}).sort({'meta.createAt':-1}).skip(_pagenum).limit(40).exec(function(err, stualldata){
        for(let i=0; i < stualldata.length; i++){
          stualldata[i].time = moment(stualldata[i].meta.createAt).format('L HH:mm');
        }
        res.render('admin/users', { 
          users: stualldata,
          active:'users',
          pagecount:pagecount,
          compageid:pagenum
        });
      })
    })
  }else{
    res.redirect('/admin/login')
  }
});

// 补旧用户的notice
router.get('/addnotice', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    res.render('admin/addnotice', {
      active:'addnotice'
    });
  }else{
    res.redirect('/admin/login')
  }
});
// 补旧用户的notice
router.post('/tuisong/add',function(req, res, next) {
  let user = req.body.user;
  let title = req.body.title;
  let content = req.body.content;
  let add_msg = [{
    title:title,
    content:content,
    createAt:moment(new Date()).format('LL')
  }]
  if(user && content && title){
    let _msg = new Notice({
      user:user,
      message:add_msg
    });
    _msg.save(function(err){
      if(err){console.log(err)}
      User.updateAllnotice(function(err){
        if(err){console.log(err)}
        res.send({
          status: 'success',
        })
      })
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 被举报作品
router.get('/tips/work', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    Worktip.find({}).sort({'meta.createAt': -1}).exec(function(err, tips){
      res.render('admin/tips_2', { 
        tips:tips,
        qf:'work',
        active:'tips'
      });
    })
  }else{
    res.redirect('/admin/login')
  }
});
// 被举报用户
router.get('/tips/user', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    Usertip.find({}).sort({'meta.createAt': -1}).exec(function(err, tips){
      res.render('admin/tips_2', { 
        tips:tips,
        qf:'user',
        active:'tips'
      });
    })
  }else{
    res.redirect('/admin/login')
  }
});

// 举报用户主页-评论
router.get('/tips/comment/user', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    UCommentip.find({}).sort({'meta.createAt': -1}).populate('toid','_id content').exec(function(err, tips){
      res.render('admin/tips', { 
        tips:tips,
        qf:'user',
        active:'tips'
      });
    })
  }else{
    res.redirect('/admin/login')
  }
});
// 举报作品详情-评论
router.get('/tips/comment/work', function(req, res, next) {
  let _admin = req.session.admin;
  if(_admin){
    WCommentip.find({}).sort({'meta.createAt': -1}).populate('toid','_id content').exec(function(err, tips){
      res.render('admin/tips', { 
        tips:tips,
        qf:'work',
        active:'tips'
      });
    })
  }else{
    res.redirect('/admin/login')
  }
});

//作品列表
router.get('/workslist/:page', function(req, res, next) {
  let _admin = req.session.admin;
  let pagenum = req.params.page;
  if(!pagenum){
    pagenum = 1
  }
  pagenum = parseInt(pagenum);
  var reg = /^[0-9]*$/;
  if(_admin && reg.test(pagenum)){
    Works.countDocuments({}).exec(function(err, pagecount){
      if(err) console.log(err)
      let _pagenum = (parseInt(pagenum)-1)*40;
      if(_pagenum < 0 || _pagenum > pagecount){
        _pagenum = 0
      }
      Works.find({}).sort({'meta.createAt':-1}).skip(_pagenum).limit(40).populate('user','nickname').exec(function(err, worksdata){
        for(let i=0; i < worksdata.length; i++){
          worksdata[i].time = moment(worksdata[i].meta.createAt).format('L HH:mm');
        }
        res.render('admin/works_list', { 
          data: worksdata,
          active:'worksall',
          pagecount:pagecount,
          compageid:pagenum
        });
      })
    })
  }else{
    res.redirect('/admin/login')
  }
});
//管路员列表
router.get('/adminlist/:page', function(req, res, next) {
  let _admin = req.session.admin;
  let pagenum = req.params.page;
  if(!pagenum){
    pagenum = 1
  }
  pagenum = parseInt(pagenum);
  var reg = /^[0-9]*$/;
  if(_admin && reg.test(pagenum)){
    Adminuser.countDocuments({}).exec(function(err, pagecount){
      if(err) console.log(err)
      let _pagenum = (parseInt(pagenum)-1)*40;
      if(_pagenum < 0 || _pagenum > pagecount){
        _pagenum = 0
      }
      Adminuser.find({}).sort({'meta.createAt':-1}).skip(_pagenum).limit(40).exec(function(err, admindata){
        for(let i=0; i < admindata.length; i++){
          admindata[i].time = moment(admindata[i].meta.createAt).format('L HH:mm');
        }
        res.render('admin/admin_list', { 
          data: admindata,
          active:'adminall',
          pagecount:pagecount,
          compageid:pagenum
        });
      })
    })
  }else{
    res.redirect('/admin/login')
  }
});
// 以下是接口

//重置用户密码
router.post('/change/user/pwd', function(req, res, next) {
  let _admin = req.session.admin;
  const userhash = crypto.createHash('sha1');
  const hash_pwd = userhash.update('xiaou').update('111111').digest('hex');
  const uid = req.body.uid;
  if(_admin && uid){
    User.updateOne({_id:uid},{$set:{password:hash_pwd}}).exec(function(err){
      res.send({
        status: 'success'
      })
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
/*  login 接口  */
router.post('/signin', function(req, res, next) {
  const userhash = crypto.createHash('sha1');
  const user_name = req.body.username;
  const user_pwd = req.body.password;
  if(user_name && user_pwd){
  	const hash_pwd = userhash.update('s1_admin').update(user_pwd).digest('hex');
  	Adminuser.fetchByName(user_name, function(err,usermsg){
	  	if(err){
	    	console.log(err);
	        res.send({
	          status: 'fail',
            msg:'服务器抢修中，暂时无法登陆'
	        })
	  	}else{
        if(usermsg.length == 0){
          res.send({
            status:'nouser',
            msg:'账号或密码错误'
          })
        }else{
          if(hash_pwd == usermsg[0].password){
              req.session.admin = usermsg[0];
              res.send({
                status:'success'
              })
          }else{
            res.send({
              status:'pwderror',
              msg:'账号或密码错误',
            })
          }
        }
	  	}
    });
  }
});
/*  regsiter 接口 */
router.post('/register', function(req, res, next) {
  const userhash = crypto.createHash('sha1');
  const user_name = req.body.username;
  const user_pwd = req.body.userpwd;
  let _usermsg;
  if(user_name && user_pwd){
  	const hash_pwd = userhash.update('s1_admin').update(user_pwd).digest('hex');
    Adminuser.fetchByName(user_name, function(err, data){
      if(err){
        console.log(err);
        res.send({
          	status: 'fail',
            msg:'服务器抢修中，暂时无法注册'
        })
      }else{
        if(data.length == 0){
          _usermsg = new Adminuser({
           	username: user_name,
           	password: hash_pwd
          });
          _usermsg.save(function(err,data){
            if (err) {
            	console.log(err);
            	res.send({
              		status: 'fail'
            	})
            }else{
              res.send({
              	status: 'success'
              })
            }
          })
        }else{
        	res.send({
	          	status: 'fail',
	            msg:'该账号已被注册'
        	})
        }
      }
    })
  }
});
// logout 接口
router.get('/logout', function(req, res, next) {
  delete req.session.admin;
  res.redirect('/admin/login')
});
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/img/index/banner'); 
    },
    filename: function (req, file, cb) {
    	cb(null, file.fieldname + '-' + guid())
    }
});

function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4());
}
// 创建 multer 对象
var upload = multer({ storage: storage });

/* 轮播上传 接口 */
router.post('/banner/uploads', upload.single('bannerimg'),function(req, res, next) {
	let file = req.file;
	const file_name = file.filename;
	const file_title = req.body.imgtitle;
	const status_id = req.body.status;
	const urls = req.body.bannerurl;
	banner_msg = {
		title:file_title,
		src:file_name,
		url:urls
	}
	if(file_title && file_name){
		if(status_id == 'new'){
			let indexmsg = new Banner({
				title:file_title,
				src:file_name,
				url:urls
			})
			indexmsg.save(function(err){
				if(err) console.log(err)
				res.send({
			        status: 'success'
			    })
			})

		}else{
			Banner.changeBanner(status_id,banner_msg, function(err, back_msg){
		      if(err){console.log(err)}
		      res.send({
		        status: 'success'
		      })
		    })
		}
		
	}else{
		res.send({
			status:'fail'
		})
	}
});
// 轮播删除接口
router.post('/banner/delete',function(req, res, next) {
	let imgid = req.body.imgid;
	
	if(imgid){
		Banner.remove({_id:imgid}).exec(function(err){
	      if(err){console.log(err)}
			res.send({
				status: 'success'
			})
	    })

	}else{
		res.send({
			status:'fail'
		})
	}
});
// 搜索用户接口
router.post('/search/user',function(req, res, next) {
  let username = req.body.username;
  if(username){
    User.find({nickname:username}).exec(function(err,userinfo){
      if(err){console.log(err)}
      if(!userinfo || userinfo.length == 0){
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status: 'success',
          userinfo:userinfo
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 推送功能——给个人接口
router.post('/tuisong/user',function(req, res, next) {
  let userid = req.body.userid;
  let title = req.body.title;
  let content = req.body.content;
  let zn_msg = {
    title:title,
    content:content,
    createAt:moment(new Date()).format('LL')
  }
  if(userid && content && title){
    Notice.updateNotice(userid,zn_msg,function(err){
      if(err){console.log(err)}

      User.updateOnenotice(userid,function(err){
        if(err){console.log(err)}
        res.send({
          status: 'success',
        })
      })

    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 推送功能——给所有用户 接口
router.post('/tuisong/all',function(req, res, next) {
  let title = req.body.title;
  let content = req.body.content;
  let ts_msg = {
    title:title,
    content:content,
    createAt:moment(new Date()).format('LL')
  }
  if(content && title){
    Notice.tsAll(ts_msg, function(err){
      if(err){console.log(err)}

      User.updateAllnotice(function(err){
        if(err){console.log(err)}
        res.send({
          status: 'success',
        })
      })

    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 封号接口
router.post('/fenhao/user',function(req, res, next) {
  let userid = req.body.userid;
  if(userid){
    User.update({_id:userid},{$set:{status:-1}}).exec(function(err){
      if(err){console.log(err)}
      res.send({
        status: 'success'
      })
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 解封号接口
router.post('/jiefenhao/user',function(req, res, next) {
  let userid = req.body.userid;
  if(userid){
    User.update({_id:userid},{$set:{status:0}}).exec(function(err){
      if(err){console.log(err)}
      res.send({
        status: 'success'
      })
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});

//修改密码
router.post('/change/pwd',function(req, res, next) {
  const userhash = crypto.createHash('sha1');
  let userid = req.body.userid;
  let oldpwd = req.body.oldpwd;
  let newpwd = req.body.newpwd;
  const hash_pwd = userhash.update('s1_admin').update(oldpwd).digest('hex');
  
  if(userid && oldpwd && newpwd){
    Adminuser.fetchById(userid, function(err,usermsg){
      if(err){
        console.log(err);
          res.send({
            status: 'fail',
            msg:'服务器抢修中，暂时无法修改'
          })
      }else{
        if(hash_pwd == usermsg[0].password){
          const userhash2 = crypto.createHash('sha1');
          const new_hash_pwd = userhash2.update('s1_admin').update(newpwd).digest('hex');
          Adminuser.updateById(userid, new_hash_pwd, function(err,usermsg){
            if(err) console.log(err)
            res.send({
              status:'success'
            })
          })
        }else{
          res.send({
            status:'pwderror',
            msg:'旧密码错误',
          })
        }
      }
    });
  }else{
    res.send({
      status:'fail'
    })
  }
});
//作品删除接口
router.post('/works/delete',function(req, res, next) {
  let wid = req.body.wid;
  if(wid){
    Works.findOne({_id:wid}).exec(function(err, work_msg){
      if(work_msg){
        Works.remove({_id:wid}).exec(function(err){
          if(err){console.log(err)}
          fs.unlink('./public/released/scratch/'+ work_msg.worksid, function (err) {
            if (err){console.log(err)}
            fs.unlink('./public/released/covers/'+ work_msg.covers, function (err) {
              if (err){
                console.log(err)
              }
            })
            res.send({
              status: 'success'
            })
          })
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
//作品查询
router.post('/search/work',function(req, res, next) {
  let wname = req.body.wname;
  if(wname){
    Works.find({title:wname}).exec(function(err,works){
      if(err){console.log(err)}
      if(!works || works.length == 0){
        res.send({
          status: 'fail',
          msg:'作品不存在或已被删除'
        })
      }else{
        res.send({
          status: 'success',
          works:works
        })
      }
    })
  }else{
    res.send({
      status:'fail',
       msg:'查询错误'
    })
  }
});


//删除用户评论
router.post('/delete/ucomment/f', function(req, res, next) {
  const cid = req.body.cid;
  const tipid = req.body.tipid;
  if(cid){
    Ucomment.deleteFById(cid, function(err) {
      if(err){
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
        UCommentip.removeById(tipid, function(err){
          if(err) console.log(err)
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
router.post('/delete/ucomment/s', function(req, res, next) {
  const cid = req.body.cid;
  const types = req.body.types;
  const tid = req.body.tid;
  const tipid = req.body.tipid;
  if(cid && tid && types=='sucom'){
    Ucomment.deleteSById(cid,tid, function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
        UCommentip.removeById(tipid, function(err){
          if(err) console.log(err)
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
//作品页评论删除
router.post('/delete/wcomment/f', function(req, res, next) {
  const cid = req.body.cid;
  const tipid = req.body.tipid;
  if(cid){
    Wcomment.deleteFById(cid, function(err) {
      if(err){
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
        WCommentip.removeById(tipid, function(err){
          if(err) console.log(err)
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
router.post('/delete/wcomment/s', function(req, res, next) {
  const cid = req.body.cid;
  const types = req.body.types;
  const tid = req.body.tid;
  const tipid = req.body.tipid;
  if(cid && tid && types=='swcom'){
    Wcomment.deleteSById(cid,tid, function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
        WCommentip.removeById(tipid, function(err){
          if(err) console.log(err)
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});



// 处理举报作品
router.post('/tips/work/done', function(req, res, next) {
  const wid = req.body.wid;
  if(wid){
    Worktip.updateById(wid, function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 处理举报用户
router.post('/tips/user/done', function(req, res, next) {
  const wid = req.body.wid;
  if(wid){
    Usertip.updateById(wid, function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
// 设置作品分类
router.post('/works/classify', function(req, res, next) {
  const classify = req.body.classify;
  if(classify){
    WorksClassify.updateByIds(classify,function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
//删除用户账号
router.post('/delete/user', function(req, res, next) {
  const userid = req.body.userid;
  if(userid){
    User.deleteOne({_id:userid}).exec(function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
//删除管理员账号
router.post('/delete/admin', function(req, res, next) {
  const adminid = req.body.aid;
  if(adminid){
    Adminuser.deleteOne({_id:adminid}).exec(function(err) {
      if(err){
        console.log(err)
        res.send({
          status:'fail'
        })
      }else{
        res.send({
          status:'success'
        })
      }
    })
  }else{
    res.send({
      status:'fail'
    })
  }
});
module.exports = router;