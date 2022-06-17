const config = {
	no_ref: "off", //Control the HTTP referrer header, if you want to create an anonymous link that will hide the HTTP Referer header, please set to "on" .
	theme: "",//Homepage theme, use the empty value for default theme. To use urlcool theme, please fill with "theme/urlcool" .
	cors: "on",//Allow Cross-origin resource sharing for API requests.
}

const html404 = `<!DOCTYPE html>
    <body style="text-align:center;">
      <h1>404<br>Não Encontrado.</h1>
      <h4>Essa URL não Existe 🤔</h4>
    </body>`

let response_header = {
	"content-type": "text/html;charset=UTF-8",
}

if (config.cors == "on") {
	response_header = {
		"content-type": "text/html;charset=UTF-8",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST",
	}
}

async function randomString(len) {
	len = len || 4;
	let $chars = 'ABCDEFGHJKLMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';    /****os caracteres confusos foram removidos****/
	let maxPos = $chars.length;
	let result = '';
	for (i = 0; i < len; i++) {
		result += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return result;
}
async function checkURL(URL) {
	let str = URL;
	let Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
	let objExp = new RegExp(Expression);
	if (objExp.test(str) == true) {
		if (str[0] == 'h')
			return true;
		else
			return false;
	} else {
		return false;
	}
}
async function save_url(URL, nome) {

	let random_key = nome ? nome : await randomString();
	
	let is_exist = await LINKS.get(random_key)
	console.log(is_exist)
	if (!is_exist)
		return await LINKS.put(random_key, URL), random_key
	else {
		return true, null
	}
}
async function handleRequest(request) {
	console.log(request)
	if (request.method === "POST") {
		let req = await request.json()
		console.log(req["url"])
		var urlid = req["urlid"] ? req["urlid"] : null
		if (!await checkURL(req["url"])) {
			return new Response(`{"status":500,"key":": Error: Url ilegal."}`, {
				headers: response_header,
			})
		}
		let stat, random_key = await save_url(req["url"], urlid)
		console.log(stat)
		if (typeof (stat) == "undefined") {
			return new Response(`{"status":200,"key":"/` + random_key + `"}`, {
				headers: response_header,
			})
		} else {
			return new Response(`{"status":200,"key":"Error"}`, {
				headers: response_header,
			})
		}
	} else if (request.method === "OPTIONS") {
		return new Response(``, {
			headers: response_header,
		})

	}

	const requestURL = new URL(request.url)
	const path = requestURL.pathname.split("/")[1]
	console.log(path)
	if (!path) {

		// const html = await fetch("https://erickythierry.github.io/shorter-html/" + config.theme + "/index.html")
		const html = await fetch("https://raw.githubusercontent.com/erickythierry/Url-Shorten-Worker/gh-pages/index.html")
		return new Response(await html.text(), {
			headers: {
				"content-type": "text/html;charset=UTF-8",
			},
		})
	}
	const value = await LINKS.get(path)
	console.log(value)


	const location = value
	if (location) {
		if (config.no_ref == "on") {
			let no_ref = await fetch("https://xytom.github.io/Url-Shorten-Worker/no-ref.html")
			no_ref = await no_ref.text()
			no_ref = no_ref.replace(/{Replace}/gm, location)
			return new Response(no_ref, {
				headers: {
					"content-type": "text/html;charset=UTF-8",
				},
			})
		} else {
			return Response.redirect(location, 302)
		}

	}
	// If request not in kv, return 404
	return new Response(html404, {
		headers: {
			"content-type": "text/html;charset=UTF-8",
		},
		status: 404
	})
}

addEventListener("fetch", async event => {
	event.respondWith(handleRequest(event.request))
})
