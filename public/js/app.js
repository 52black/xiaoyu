// 入口文件
$(function(){
	$('.user-pa-btn').click(function(){
		$('.show-error-msg').hide()
	})
	/* 点击登录 */
	$('#login-btn').click(function(){
		let that = $(this);
		let login_msg = {
			username: $('#login_username').val(),
			userpwd:  $('#login_userpwd').val()
		}
		let errormsg;
		if(!login_msg.username || !login_msg.userpwd){
			errormsg = '用户名或密码不能为空';
			showErrorMsg(true, errormsg)
		}else if(!usernameTest(login_msg.username)){
			errormsg = '账号不正确';
			showErrorMsg(true, errormsg)
		}else{
			showErrorMsg(false);
			that.attr('disabled','disabled');
			$.ajax({
				url:'/signin',
				type:'POST',
				data:login_msg,
				success:function(data){
					that.attr('disabled',false);
					if(data.status == 'success'){
						window.location.reload()
					}else{
						errormsg = data.msg;
						showErrorMsg(true, errormsg)
					}
					
				},
				error: function(err){
					that.attr('disabled',false);
					errormsg = '登录失败';
					showErrorMsg(true, errormsg)
				}
			})
		}
	})
	/* 点击注册 */
	$('#reg-btn').click(function(){
		let that = $(this);
		let reg_msg = {
			username: $('#reg_username').val(),
			nickname: $('#reg_nickname').val(),
			userpwd:  $('#reg_userpwd').val(),
			samepwd:  $('#reg_same_userpwd').val()
		}
		let errormsg;
		if(!reg_msg.username || !reg_msg.nickname || !reg_msg.userpwd){
			errormsg = '输入框不能为空';
			showErrorMsg(true, errormsg)
		}else if(reg_msg.userpwd !== reg_msg.samepwd){
			errormsg = '两次密码不一致';
			showErrorMsg(true, errormsg)
		}else if(!usernameTest(reg_msg.username)){
			errormsg = '账号格式不正确';
			showErrorMsg(true, errormsg)
		}else if(!userpwdTest(reg_msg.userpwd)){
			errormsg = '密码格式不正确';
			showErrorMsg(true, errormsg)
		}else{
			showErrorMsg(false);
			that.attr('disabled','disabled');
			$.ajax({
				url:'/register',
				type:'POST',
				data:reg_msg,
				success:function(data){
					that.attr('disabled',false);
					if(data.status == 'success'){
						window.location.reload()
					}else{
						errormsg = data.msg;
						showErrorMsg(true, errormsg)
					}
					
				},
				error: function(err){
					that.attr('disabled',false);
					errormsg = '注册失败';
					showErrorMsg(true, errormsg)
				}
			})
		}
	})
	$(document).keyup(function(event){
		if(event.keyCode ==13){
			$('#login-btn').trigger("click");
		}
	});
	/* 用户测试 */
	const usernameTest = function(data){
		const reg = /^(\w+){6,18}$/
		return reg.test(data)
	}
	const userpwdTest = function(data){
		const reg = /^(?:\d+|[a-zA-Z]+|[!@#$%^&*]+){6,18}$/
		return reg.test(data)
	}
	const showErrorMsg = function(status, errormsg){
		let show_msg = $('.show-error-msg');
		if(status){
			show_msg
			.text(errormsg)
			.show()
		}else{
			show_msg
			.text('')
			.hide()
		}
	}
	/* noteModal */
	function showNoteModal(msg){
		$('#nodemsg').html(msg)
		$('#noteModal').modal('show')
		setTimeout(function(){
			$('#noteModal').modal('hide')
		},500)
	}
	/* usercenter Html */
	function Zoom(obj, maxWidth, maxHeight){ 
		var image = new Image();
		image.src = obj;
		var Width,Height;
		if (image.width < maxWidth && image.height < maxHeight) {
            Width = maxWidth;
            Height = maxHeight;
        }
        else
        {
            if (maxWidth / maxHeight  <= image.width / image.height)
            {
                Width = maxWidth;
                Height = maxWidth * (image.height / image.width);
            } 
            else {
                Width = maxHeight * (image.width / image.height);
                Height = maxHeight;
            }
        }

		image.onload = function(){
			var canvas = document.createElement("canvas");
			canvas.width = 100;
    		canvas.height = 100;
			var ctx=canvas.getContext("2d");
            ctx.drawImage(image,0,0,Width,Height);
            var newImg=new Image();
			newImg.src = canvas.toDataURL("image/png");
			newImg.id = 'headimg-div';
			var image_holder = $("#image-holder");
        	$(newImg).appendTo(image_holder);
        }
	}
	$("#fileUpload").on('change', function () {
	    if (typeof (FileReader) != "undefined") {
	        var image_holder = $("#image-holder");
	        image_holder.empty();
	        var reader = new FileReader();
	        reader.onload = function (e) {
	        	Zoom(e.target.result,100,100)
	        }
	        image_holder.show();
	        reader.readAsDataURL($(this)[0].files[0]);
	    } else {
	        alert("你当前浏览器不支持头像上传，请升级或更换。");
	    }
	});
	$('#user-msg-btn').click(function () {
		let setting_msg = {
			_id: $('#koep').val(),
			headimg: $('#image-holder img').attr('src'),
			nickname: $('#set_nickname').val(),
			realname: $('#set_realname').val(),
			phoneNum: $('#set_phone').val(),
			motto: $('#set_motto').val(),
			qq: $('#set_qq').val(),
			wx: $('#set_wx').val(),
			email: $('#set_email').val(),
		}
		console.log(setting_msg)
		if(!setting_msg._id ||  !setting_msg.headimg || !setting_msg.nickname){
			showNoteModal('昵称不能为空')
			return false;
		}else{
			$.ajax({
				url: '/users/usercenter/change',
				type:"POST",
				data:setting_msg,
				success:function (data){
					showNoteModal('<img src="/img/user/success.svg" width=26 /> 修改成功')
					window.location.href = "/users/userindex/" + setting_msg._id
					
				}
			})
		}
	})
	// 给用户点赞
	$(document).on('click','#liked-uzan',function(){
		const that = $(this);
		let zanNum = parseInt(that.find('#userzan').text());
		that.toggleClass('liked');
		let acNum = 0;
		if(that.hasClass('liked')){
			acNum = 1;
			that.find('#userzan').text(zanNum+1)
			that.find('#zani').text('已赞')
		}else{
			that.find('span').text(zanNum-1)
			that.find('#zani').text('赞')
		}
		const u_zan = {
			userid: $('#index_userid').val(),
			zuid: $('#index_myid').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && u_zan.userid && u_zan.zuid){
			cando = 0;
			$.ajax({
				url: '/users/ucomment/uzan',
				type:"POST",
				data:u_zan,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}

	});
	// 关注
	$(document).on('click','#liked-followed',function(){
		const that = $(this);
		let follNum = parseInt($('#userfoller').text());
		console.log(follNum)
		let reg = /^[0-9]+[0-9]*]*$/;
		if(reg.test(follNum)){
			that.toggleClass('liked');
			let acNum = 0;
			if(that.hasClass('liked')){
				acNum = 1;
				$('#userfoller').text(follNum+1)
				that.find('#folli').text('已关注')
			}else{
				$('#userfoller').text(follNum-1)
				that.find('#folli').text('+ 关注')
			}
			const u_foll = {
				userid: $('#index_userid').val(),
				myid: $('#index_myid').val(),
				acnum:acNum
			}
			let cando = 1;
			if(cando == 1 && u_foll.userid && u_foll.myid){
				cando = 0;
				$.ajax({
					url: '/users/ufoll',
					type:"POST",
					data:u_foll,
					success:function(){
						cando = 1
					},
					error:function(){
						cando = 1
					}
				})
			}
		}
	});
	// 给用户留言 一级
	$(document).on('click','#uot-send-btn',function(){
		const that = $(this);
		const u_comment = {
			user: $('#index_userid').val(),
			fromid: that.attr('fid'),
			content:that.prev().find('textarea').val()
		}
		$.ajax({
			url: '/users/ucomment',
			type:"POST",
			data:u_comment,
			success:function (data){
				showNoteModal('<img src="/img/user/success.svg" width=20 /> 评论成功')
				setTimeout(function(){
					window.location.reload()
				},350)
				
			}
		})
	})
	// 给用户留言 动态增加留言框
	$(document).on('click','.uot-comment-second',function(){
		const that = $(this);
		if(!that.hasClass('open')){
			let str ='';
			str += '<div class="ot-add-comment"><div class="po-re">';
			str += '<textarea class="form-control" rows="4" maxlength="140"></textarea><p class="hky-write">还可以输入<span>140</span>个字</p></div>';
	        str += '<button class="ot-send-btn usecond-send-btn" type="button" disabled="disabled">留言</button></div>';
	        that.parent().parent().append(str);
	        that.addClass('open');
		}else{
			that.parent().next().remove()
			that.removeClass('open');
		}
		
	})
	// 给用户留言 叠楼
	$(document).on('click','.usecond-send-btn',function(){
		const that = $(this);
		const s_u_comment = {
			user: that.parent().parent().attr('cid'),
			fromid: $('#index_myid').val(),
			toid: that.parent().parent().attr('uid'),
			content:that.prev().find('textarea').val()
		}
		$.ajax({
			url: '/users/ucomment/second',
			type:"POST",
			data:s_u_comment,
			success:function (data){
				if(data.status =='success'){
					showNoteModal('<img src="/img/user/success.svg" width=20 /> 评论成功')
					setTimeout(function(){
						window.location.reload()
					},350)
				}else{
					alert(data.msg)
				}
				
				
			}
		})
	});
	
	//给用户留言点赞
	$(document).on('click','.fu-zan',function(){
		const that = $(this);
		let zanNum = parseInt(that.find('span').attr('zannum'));
		that.toggleClass('ac').addClass('amd');
		let acNum = 0;
		if(that.hasClass('ac')){
			acNum = 1;
			that.find('span').text(zanNum+1)
		}else{
			that.find('span').text(zanNum-1)
		}
		const f_zan = {
			zanid: that.parent().parent().attr('cid'),
			myid: $('#index_myid').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && f_zan.zanid && f_zan.myid){
			cando = 0;
			$.ajax({
				url: '/users/ucomment/fzan',
				type:"POST",
				data:f_zan,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}
		
	})
	//给用户留言点赞 叠楼的赞
	$(document).on('click','.su-zan',function(){
		const that = $(this);
		let zanNum = parseInt(that.find('span').attr('zannum'));
		that.toggleClass('ac').addClass('amd');
		let acNum = 0;
		if(that.hasClass('ac')){
			acNum = 1;
			that.find('span').text(zanNum+1)
		}else{
			that.find('span').text(zanNum-1)
		}
		const f_zan = {
			fzanid:that.parent().parent().attr('cid'),
			szanid: that.parent().parent().attr('tid'),
			myid: $('#index_myid').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && f_zan.fzanid && f_zan.szanid && f_zan.myid){
			cando = 0;
			$.ajax({
				url: '/users/ucomment/szan',
				type:"POST",
				data:f_zan,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}
		
	})
	//留言字数限制
	$(document).on('keyup','.po-re textarea',function(){
		let str = $(this).val();
		let reg = /\S/;
		if(reg.test(str))
		{
		  	var len = str.length;
			if(len > 0){
				$(this).parent().parent().find('.ot-send-btn').attr('disabled',false)
			}else{
				$(this).parent().parent().find('.ot-send-btn').attr('disabled',true)
			}
		   	if(len > 139){
		    	$(this).val($(this).val().substring(0,140));
		   	}
		   	var num = 140 - len;
		   	$(this).parent().find('.hky-write span').text(num)
		}else{
			$(this).parent().find('.hky-write span').text(140)
			$(this).parent().parent().find('.ot-send-btn').attr('disabled',true)
		}
		
	})
	// 给作品点赞功能
	$(document).on('click','#zan-works-btn',function(){
		const that = $(this);
		let zanNum = parseInt(that.attr('wzan'));
		that.toggleClass('ac');
		let acNum = 0;
		if(!that.hasClass('ac') && zanNum < 0){
			return false;
		}
		if(that.hasClass('ac')){
			acNum = 1;
			that.find('span').text(zanNum+1)
		}else{
			that.find('span').text(zanNum-1)
		}
		const w_zan = {
			uid: $('#local-userid').val(),
			wid: $('#works_id').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && w_zan.uid && w_zan.wid){
			cando = 0;
			$.ajax({
				url: '/works/wcontent/wzan',
				type:"POST",
				data:w_zan,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}
	})
	// 给作品收藏功能
	$(document).on('click','#keep-works-btn',function(){
		const that = $(this);
		that.toggleClass('ac');
		let acNum = 0;
		if(that.hasClass('ac')){
			acNum = 1;
			that.find('span').text('已收藏')
		}else{
			that.find('span').text('收藏')
		}
		const w_keep = {
			uid: $('#local-userid').val(),
			wid: $('#works_id').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && w_keep.uid && w_keep.wid){
			cando = 0;
			$.ajax({
				url: '/works/wcontent/wkeep',
				type:"POST",
				data:w_keep,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}
	})
	// 给作品留言
	$(document).on('click','#wot-send-btn',function(){
		const that = $(this);
		const u_comment = {
			works: $('#works_id').val(),
			fromid: that.attr('fid'),
			content:that.prev().find('textarea').val()
		}
		$.ajax({
			url: '/works/ucomment',
			type:"POST",
			data:u_comment,
			success:function (data){
				showNoteModal('<img src="/img/user/success.svg" width=20 /> 评论成功')
				setTimeout(function(){
					window.location.reload()
				},300)
				
			}
		})
	})
	// 给用户留言 动态增加留言框
	$(document).on('click','.wot-comment-second',function(){
		const that = $(this);
		if(!that.hasClass('open')){
			let str ='';
			str += '<div class="ot-add-comment"><div class="po-re">';
			str += '<textarea class="form-control" rows="4" maxlength="140"></textarea><p class="hky-write">还可以输入<span>140</span>个字</p></div>';
	        str += '<button class="ot-send-btn wsecond-send-btn" type="button" disabled="disabled">留言</button></div>';
	        that.parent().parent().append(str);
	        that.addClass('open');
		}else{
			that.parent().next().remove()
			that.removeClass('open');
		}
		
	})
	// 给作品留言 叠楼
	$(document).on('click','.wsecond-send-btn',function(){
		const that = $(this);
		const s_u_comment = {
			works: that.parent().parent().attr('cid'),
			fromid: $('#local-userid').val(),
			toid: that.parent().parent().attr('uid'),
			content:that.prev().find('textarea').val()
		}
		$.ajax({
			url: '/works/ucomment/second',
			type:"POST",
			data:s_u_comment,
			success:function (data){
				if(data.status =='success'){
					showNoteModal('<img src="/img/user/success.svg" width=20 /> 评论成功')
					setTimeout(function(){
						window.location.reload()
					},300)
				}else{
					alert(data.msg)
				}
				
				
			}
		})
	});
	
	//给作品留言点赞
	$(document).on('click','.fw-zan',function(){
		const that = $(this);
		let zanNum = parseInt(that.find('span').attr('zannum'));
		that.toggleClass('ac').addClass('amd');
		let acNum = 0;
		if(that.hasClass('ac')){
			acNum = 1;
			that.find('span').text(zanNum+1)
		}else{
			that.find('span').text(zanNum-1)
		}
		const f_zan = {
			zanid: that.parent().parent().attr('cid'),
			myid: $('#local-userid').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && f_zan.zanid && f_zan.myid){
			cando = 0;
			$.ajax({
				url: '/works/ucomment/fzan',
				type:"POST",
				data:f_zan,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}
		
	})
	//给作品留言点赞 叠楼的赞
	$(document).on('click','.sw-zan',function(){
		const that = $(this);
		let zanNum = parseInt(that.find('span').attr('zannum'));
		that.toggleClass('ac').addClass('amd');
		let acNum = 0;
		if(that.hasClass('ac')){
			acNum = 1;
			that.find('span').text(zanNum+1)
		}else{
			that.find('span').text(zanNum-1)
		}
		const f_zan = {
			fzanid:that.parent().parent().attr('cid'),
			szanid: that.parent().parent().attr('tid'),
			myid: $('#local-userid').val(),
			acnum:acNum
		}
		let cando = 1;
		if(cando == 1 && f_zan.fzanid && f_zan.szanid && f_zan.myid){
			cando = 0;
			$.ajax({
				url: '/works/ucomment/szan',
				type:"POST",
				data:f_zan,
				success:function(){
					cando = 1
				},
				error:function(){
					cando = 1
				}
			})
		}
		
	})

	//作品检索
	
	$(document).on('click','#w-search-btn',function(){
		let searchval = $('#searchworks').val();
		if(searchval){
			window.location.href='/works?page=1&type=a&sort=zan&wd='+searchval;
		}
	})
	$(document).keyup(function(event){
		if(event.keyCode ==13){
			$("#w-search-btn").trigger("click");
		}
	});



	//删除未发布作品
	let worksmsg, w_type;
	$('.delete-works-a').click(function(){
		w_type = $(this).attr('wtype');
		let works_id = $(this).attr('wid');
		let works_locals = $(this).attr('wlocals');
		let clocals = $(this).attr('clocals');
		worksmsg = {
			id: works_id,
			locals: works_locals,
			covers: clocals
		}
	})

	$('#delete-works').click(function(){
		if(worksmsg && worksmsg.id !==0 && worksmsg.locals !== 0 ){
			if(w_type == 'unrel'){
				$.ajax({
					url:'/users/delete/unrel',
					type:'POST',
					data:worksmsg,
					success:function(data){
						if(data.status == 'success'){
							$('#deleteWorks').modal('hide')
							setTimeout(function(){
								window.location.reload()
							},350)
							showNoteModal('删除成功')
						}else{
							$('#deleteWorks').modal('hide')
							showNoteModal('删除失败')
						}
					},
					error:function(){
						$('#deleteWorks').modal('hide')
						showNoteModal('删除失败')
					}
				})
			}else{
				$.ajax({
					url:'/users/delete/rels',
					type:'POST',
					data:worksmsg,
					success:function(data){
						if(data.status == 'success'){
							$('#deleteWorks').modal('hide')
							setTimeout(function(){
								window.location.reload()
							},350)
							showNoteModal('删除成功')
						}else{
							$('#deleteWorks').modal('hide')
							showNoteModal('删除失败')
						}
					},
					error:function(){
						$('#deleteWorks').modal('hide')
						showNoteModal('删除失败')
					}
				})
			}
			
		}
	})


	$('#saishi-btn').click(function(){
		let sscontent = {
			title: $('#ss-title').val(),
			school: $('#ss-school').val(),
			phone: $('#ss-phone').val(),
			email: $('#ss-email').val(),
		}
		if(sscontent.title && sscontent.school && sscontent.phone && sscontent.email){
			$.ajax({
				url:'/match/tj',
				type:'POST',
				data:sscontent,
				success:function(data){
					if(data.status == 'success'){
						$('#ss-err-msg').hide();
						$('#saishi').modal('hide');
						$('#saishitixing').modal('show');
					}else{
						alert('提交失败，请重试！')
					}
				},
				error:function(){
					alert('提交失败，请重试！')
				}
			})
		}else{
			$('#ss-err-msg').show()
		}
	})

	$('#about-us-ul li').click(function(){
		$(this).addClass('active').siblings().removeClass('active')
	})

	//意见反馈
	$('#sug-send-btn').click(function(){
		let sugmsg = {
			userid: $(this).attr('fid'),
			content:$('#sug-msg').val()
		}
		if(sugmsg.userid && sugmsg.content){
			$.ajax({
				url:'/user/suggest',
				type:'POST',
				data:sugmsg,
				success:function(data){
					if(data.status == 'success'){
						alert('发送成功')
					}else{
						alert('发送失败')
					}
				},
				error:function(){
					alert('发送失败')
				}
			})
		}else{
			alert('不能为空')
		}
	})
	//问题反馈
	$('#feed-send-btn').click(function(){
		let feedmsg = {
			userid: $(this).attr('fid'),
			content:$('#feed-msg').val()
		}
		if(feedmsg.userid && feedmsg.content){
			$.ajax({
				url:'/user/feedback',
				type:'POST',
				data:feedmsg,
				success:function(data){
					if(data.status == 'success'){
						alert('发送成功')
					}else{
						alert('发送失败')
					}
				},
				error:function(){
					alert('发送失败')
				}
			})
		}else{
			alert('不能为空')
		}
	})
	//删除一条通知
	$('.delete-one-notice').click(function(){
		let nid = $(this).attr('nid');
		$('#onenoticeid').val(nid);
		$('#deleteOne').modal('show');
	})
	$('#delete-one-btn').click(function(){
		let that = $(this)
		let nid = $('#onenoticeid').val();
		let uid = $('#local-userid').val();
		console.log(uid)
		if(nid && uid){
			$.ajax({
				url:'/users/delete/notice/one',
				type:'POST',
				data:{
					nid:nid,
					uid:uid
				},
				success:function(data){
					if(data.status == 'success'){
						$('#deleteOne').modal('hide');
						$('#'+nid).remove();
						if($('.user-notice-list').length == 0){
							$('.delete-all-notice').remove();
							$('.no-notice').show()
						}
					}else{
						alert('删除失败')
					}
				},
				error:function(){
					alert('删除失败')
				}
			})
		}
	})
	$('#delete-all-btn').click(function(){
		let uid = $('#local-userid').val()
		if(uid){
			$.ajax({
				url:'/users/delete/notice/all',
				type:'POST',
				data:{
					uid:uid
				},
				success:function(data){
					if(data.status == 'success'){
						window.location.reload()
					}else{
						alert('删除失败')
					}
				},
				error:function(){
					alert('删除失败')
				}
			})
		}
	});
	//删除用户页面评论
	$('.uot-comment-delete').click(function(){
		let cid = $(this).parent().parent().attr('cid');
		let types = $(this).attr('types');
		$('#deletecid-f').val(cid);
		$('#deletecid-f').attr('ctypes',types);
		if(types == 'scom'){
			let tid = $(this).attr('tid');
			$('#deletecid-s').val(tid);
		}
		$('#deleteComment').modal('show');
	})
	$('#delete-comf-btn').click(function(){
		let cid = $('#deletecid-f').val();
		let types = $('#deletecid-f').attr('ctypes')
		if(cid){
			if(types == 'fcom'){
				$.ajax({
					url:'/users/delete/comment/f',
					type:'POST',
					data:{
						types:types,
						cid:cid
					},
					success:function(data){
						if(data.status == 'success'){
							$('#deleteComment').modal('hide');
							$('#'+cid).remove()
						}else{
							alert('删除失败')
						}
					},
					error:function(){
						alert('删除失败')
					}
				})
			}else if(types == 'scom'){
				let tid = $('#deletecid-s').val();
				$.ajax({
					url:'/users/delete/comment/s',
					type:'POST',
					data:{
						types:types,
						cid:cid,
						tid:tid
					},
					success:function(data){
						if(data.status == 'success'){
							$('#deleteComment').modal('hide');
							$('#'+tid).remove()
						}else{
							alert('删除失败')
						}
					},
					error:function(){
						alert('删除失败')
					}
				})
			}
			
		}
	})
	//删除作品页面评论
	$('.wot-comment-delete').click(function(){
		let cid = $(this).parent().parent().attr('cid');
		let types = $(this).attr('types');
		$('#wdeletecid-f').val(cid);
		$('#wdeletecid-f').attr('ctypes',types);
		if(types == 'swcom'){
			let tid = $(this).attr('tid');
			$('#wdeletecid-s').val(tid);
		}
		$('#deleteWcomment').modal('show');
	})
	$('#delete-wcomf-btn').click(function(){
		let cid = $('#wdeletecid-f').val();
		let types = $('#wdeletecid-f').attr('ctypes')
		if(cid){
			if(types == 'fwcom'){
				$.ajax({
					url:'/users/delete/wcomment/f',
					type:'POST',
					data:{
						types:types,
						cid:cid
					},
					success:function(data){
						if(data.status == 'success'){
							$('#deleteWcomment').modal('hide');
							$('#'+cid).remove()
						}else{
							alert('删除失败')
						}
					},
					error:function(){
						alert('删除失败')
					}
				})
			}else if(types == 'swcom'){
				let tid = $('#wdeletecid-s').val();
				$.ajax({
					url:'/users/delete/wcomment/s',
					type:'POST',
					data:{
						types:types,
						cid:cid,
						tid:tid
					},
					success:function(data){
						if(data.status == 'success'){
							$('#deleteWcomment').modal('hide');
							$('#'+tid).remove()
						}else{
							alert('删除失败')
						}
					},
					error:function(){
						alert('删除失败')
					}
				})
			}
			
		}
	})
	//举报
	$('.uot-comment-tip').click(function(){
		let cid = $(this).parent().parent().attr('cid');
		let types = $(this).attr('types');
		$('#tipcid-f').val(cid);
		$('#tipcid-f').attr('ctypes',types);
		if(types == 'stip'){
			let tid = $(this).attr('tid');
			$('#tipcid-s').val(tid);
		}
		$('#tipComment').modal('show');
	})
	$('#tip-comf-btn').click(function(){
		let uid = $('#local-userid').val();
		let cid = $('#tipcid-f').val();
		let types = $('#tipcid-f').attr('ctypes')
		let tipmsg = $('#tip-comf-val').val();
		if(uid && cid && tipmsg){
			if(types == 'ftip'){
				$.ajax({
					url:'/users/tip/comment/f',
					type:'POST',
					data:{
						uid:uid,
						cid:cid,
						tipmsg:tipmsg
					},
					success:function(data){
						if(data.status == 'success'){
							alert('举报成功');
							$('#tipComment').modal('hide');
						}else{
							alert('举报失败')
						}
					},
					error:function(){
						alert('举报失败')
					}
				})
			}else if(types == 'stip'){
				let tid = $('#tipcid-s').val();
				$.ajax({
					url:'/users/tip/comment/s',
					type:'POST',
					data:{
						uid:uid,
						cid:cid,
						tid:tid,
						tipmsg:tipmsg
					},
					success:function(data){
						if(data.status == 'success'){
							alert('举报成功');
							$('#tipComment').modal('hide');
						}else{
							alert('举报失败')
						}
					},
					error:function(){
						alert('举报失败')
					}
				})
			}
			
		}
	})
	//作品页面举报
	$('.wot-comment-tip').click(function(){
		let cid = $(this).parent().parent().attr('cid');
		let types = $(this).attr('types');
		$('#wtipcid-f').val(cid);
		$('#wtipcid-f').attr('ctypes',types);
		if(types == 'swtip'){
			let tid = $(this).attr('tid');
			$('#wtipcid-s').val(tid);
		}
		$('#tipWcomment').modal('show');
	})
	$('#tip-wcomf-btn').click(function(){
		let uid = $('#local-userid').val();
		let cid = $('#wtipcid-f').val();
		let types = $('#wtipcid-f').attr('ctypes');
		let tipmsg = $('#tip-wcomf-val').val();
		if(uid && cid && tipmsg){
			if(types == 'fwtip'){
				$.ajax({
					url:'/users/tip/wcomment/f',
					type:'POST',
					data:{
						uid:uid,
						cid:cid,
						tipmsg:tipmsg,
						types:types
					},
					success:function(data){
						if(data.status == 'success'){
							alert('举报成功');
							$('#tipWcomment').modal('hide');
						}else{
							alert('举报失败')
						}
					},
					error:function(){
						alert('举报失败')
					}
				})
			}else if(types == 'swtip'){
				let tid = $('#wtipcid-s').val();
				$.ajax({
					url:'/users/tip/wcomment/s',
					type:'POST',
					data:{
						uid:uid,
						cid:cid,
						tid:tid,
						tipmsg:tipmsg,
						types:types
					},
					success:function(data){
						if(data.status == 'success'){
							alert('举报成功');
							$('#tipWcomment').modal('hide');
						}else{
							alert('举报失败')
						}
					},
					error:function(){
						alert('举报失败')
					}
				})
			}
			
		}
	})
	function cancelSpace(e){
	    var e = e|| window.event;
	    var elm = e.srcElement || e.target;
	    var key = e.keyCode || e.charCode;
	    if(key == 32){
	        if(elm.tagName.toLowerCase()=="input" && elm.type.toLowerCase()=="text" || elm.tagName.toLowerCase() == "textarea"){         
	            return;	            
	        }
	        if(window.event){	            
	            e.returnValue = false;	            
	        }
	        else{
	        	e.preventDefault(); 
	        }
	    }
	};
	document.onkeypress=cancelSpace;
	//作品页面举报
	$('.lot-comment-tip').click(function(){
		let cid = $(this).parent().parent().attr('cid');
		let types = $(this).attr('types');
		$('#ltipcid-f').val(cid);
		$('#ltipcid-f').attr('ctypes',types);
		if(types == 'sltip'){
			let tid = $(this).attr('tid');
			$('#ltipcid-s').val(tid);
		}
		$('#tipLcomment').modal('show');
	})
	$('#tip-lcomf-btn').click(function(){
		let uid = $('#local-userid').val();
		let cid = $('#ltipcid-f').val();
		let types = $('#ltipcid-f').attr('ctypes');
		let tipmsg = $('#tip-lcomf-val').val();
		if(uid && cid && tipmsg){
			if(types == 'fltip'){
				$.ajax({
					url:'/users/tip/lcomment/f',
					type:'POST',
					data:{
						uid:uid,
						cid:cid,
						tipmsg:tipmsg,
						types:types
					},
					success:function(data){
						if(data.status == 'success'){
							alert('举报成功');
							$('#tipLcomment').modal('hide');
						}else{
							alert('举报失败')
						}
					},
					error:function(){
						alert('举报失败')
					}
				})
			}else if(types == 'sltip'){
				let tid = $('#wtipcid-s').val();
				$.ajax({
					url:'/users/tip/lcomment/s',
					type:'POST',
					data:{
						uid:uid,
						cid:cid,
						tid:tid,
						tipmsg:tipmsg,
						types:types
					},
					success:function(data){
						if(data.status == 'success'){
							alert('举报成功');
							$('#tipLcomment').modal('hide');
						}else{
							alert('举报失败')
						}
					},
					error:function(){
						alert('举报失败')
					}
				})
			}
			
		}
	})

	//举报作品
	$('#tip-work-btn').click(function(){
		let uid = $('#local-userid').val();
		let wid = $('#works_id').val();
		let tipmsg = $('#tip-work-val').val();
		if(uid && wid && tipmsg){
			$.ajax({
				url:'/users/tip/work',
				type:'POST',
				data:{
					uid:uid,
					wid:wid,
					tipmsg:tipmsg
				},
				success:function(data){
					if(data.status == 'success'){
						alert('举报成功');
						$('#tipWork').modal('hide');
					}else{
						alert('举报失败')
					}
				},
				error:function(){
					alert('举报失败')
				}
			})
		}
	})

	//举报用户
	$('#tip-user-btn').click(function(){
		let uid = $('#local-userid').val();
		let _uid = $('#index_userid').val();
		let tipmsg = $('#tip-user-val').val();
		if(uid && _uid && tipmsg){
			$.ajax({
				url:'/users/tip/user',
				type:'POST',
				data:{
					uid:uid,
					_uid:_uid,
					tipmsg:tipmsg
				},
				success:function(data){
					if(data.status == 'success'){
						alert('举报成功');
						$('#tipUser').modal('hide');
					}else{
						alert('举报失败')
					}
				},
				error:function(){
					alert('举报失败')
				}
			})
		}
	});
	//修改密码
	$('#user-changepwd').click(function(){
		let old_pwd = $('#old_password').val();
		let new_pwd = $('#new_password').val();
		let same_pwd = $('#same_password').val();
		if(!old_pwd || !new_pwd || !same_pwd){
			errormsg = '密码不能为空';
			showErrorMsg(true, errormsg)
		}else if(!userpwdTest(new_pwd)){
			errormsg = '密码格式不正确';
			showErrorMsg(true, errormsg)
		}else if(new_pwd !== same_pwd){
			errormsg = '两次密码不一致';
			showErrorMsg(true, errormsg)
		}else{
			$.ajax({
				url:'/users/change/password',
				type:'POST',
				data:{
					old_pwd:old_pwd,
					new_pwd:new_pwd
				},
				success:function(data){
					if(data.status == 'success'){
						alert('修改成功');
					}else{
						alert(data.msg)
					}
				},
				error:function(){
					alert('修改失败')
				}
			})
		}
	})
})
















