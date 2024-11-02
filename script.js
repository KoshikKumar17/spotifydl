//© Koshik Kumar
// Thanks to api.fabdl.com

var url;
var res;
var host = 'https://api.fabdl.com';

function get_mp3()
{
	if (typeof timer != 'undefined') {
		clearInterval(timer);
	}
	let val = document.getElementById('search-input').value;
	if (val) {
		if (val.indexOf(music_site) < 0) {
			return alert('url error');
		}
		if (val == url && res) {
			print_content(media, res);
		} else {
			url = val;
			res = null;
			var get_url = host + '/' + media + '/get?url=' + encodeURIComponent(url);
			document.getElementById('search-submit').style.display = 'none';
			document.getElementById('loader').style.display = 'inline-block';
			document.getElementById("info").innerHTML = "<img style='height: 300px;' src='data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' />";
			axios.get(get_url).then(function (response) {
				document.getElementById('search-submit').style.display = 'inline-block';
				document.getElementById('loader').style.display = 'none';
				if (response.data.result) {
					res = response.data.result;
					print_content(media, response.data.result);
				} else {
					document.getElementById("info").innerHTML = '<b style="color:red;">An error has occured while searching. Please try again later.</b>';
				}
			}).catch(function (error) {
				console.log(error);
			});
		}
	} else {
		alert('Paste URL');
	}
}

function print_content(media, result)
{
	let html = "<img style='height: 300px;' src='"+result.image+"' />";
	html += "<h3>"+result.name+"</h3>";
	if (result.type == 'playlist') {
		html += "<p>" + result.owner +"</p>"
	} else {
		html += "<p>" + result.artists +"</p>"
	}
	if (result.type == 'track') {
		result.tracks = [result];
	}
	for (var i in result.tracks) {
		var track = result.tracks[i];
		let param = btoa(encodeURIComponent(JSON.stringify({
			'id': track.id,
			'gid': result.gid,
			'name': track.name,
			'image': result.type == 'playlist' ? track.image : result.image,
			'duration_ms': track.duration_ms,
			'artists': track.artists,
		})));
		if (result.type == 'playlist') {
			html += '<div class="grid-playlist-container mb-3">';
		} else {
			html += '<div class="grid-container mb-3">';
		}
		
		html += '<div class="grid-item"><div class="grid-text"><span>' + (parseInt(i) + 1) + '.</span></div></div>';
		
		if (result.type == 'playlist') {
			html += '<div class="grid-item"><img src="' + track.image + '" /></div>';
		}
		
		html += '<div class="grid-item"><div class="grid-text"><span>' + track.name + '</span><br>' + track.artists + '</div></div>';
		html += '<div class="grid-item"><input class="get-download-submit" type="submit" value="Get Download" onclick="mp3_convert_task(\'' + media + '\', \'' + param + '\')"></div>';
		html += '</div>';
	}
	document.getElementById("info").innerHTML = html;
}

function mp3_convert_task(media, data)
{
	document.querySelector('#main').scrollIntoView(true);
	data = JSON.parse(decodeURIComponent(atob(data)));
	let progress_s = Math.ceil(data.duration_ms / 60000);	
	let html = "<img style='height: 300px;' src='" + data.image + "' />";
	html += "<h3>" + data.name + "</h3><p>" + data.artists + "</p>";
	html += "<div id='download_mp3'><a class='download-btn download-loading' href=''>Get Download</a></div>";
	document.getElementById("info").innerHTML = html;
	axios.get(host + '/' + media + '/mp3-convert-task/' + data.gid + '/' + data.id).then(function (response) {
		if (response.data.result) {
			var tid = response.data.result.tid;
			window.timer = setInterval(()=>{ 
				setTimeout(function () {
					axios.get( host + '/' + media + '/mp3-convert-progress/' + tid ).then(function (response) {
						if (response.data.result) {
							let result =  response.data.result;
							if (result.status == 3) {
								document.getElementById("download_mp3").innerHTML = "<a class='download-btn' href='" + host + result.download_url + "'>Download MP3 (128K)</a>";
								clearInterval(timer);
							} else if (result.status < 0) {
								alert('convert error');
								clearInterval(timer);
							}
						} else {
							alert('convert error');
							clearInterval(timer);
						}
					}).catch(function (error) {
						console.log(error);
					});
				}, 0);
			}, 1000);
		} else {
			alert('task error');
		}
	}).catch(function (error) {
		console.log(error);
	});	
}

// Thanks
      
