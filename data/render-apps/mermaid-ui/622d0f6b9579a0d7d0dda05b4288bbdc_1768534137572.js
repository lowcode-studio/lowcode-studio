window.utils = {
	/**
	 * i18n
	 */
	i18n: {
		setLocale: (lang) => {
			window._render_event_emitter.emit("setLanguage", lang)
		}
	},
	
	// 辅助函数示例：获取根域名（根据实际需求实现）
	rootDomain() {
		if (location.host.includes('localhost')) {
			return 'localhost'
		}
		const ipRegText = '(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])'
		if (new RegExp(`^${ipRegText}$`).test(location.hostname)) {
			return location.hostname
		}
		let hostArr = location.hostname.split('.')
		if (hostArr.length <= 2) {
			return hostArr.join('.')
		}
		return hostArr.slice(hostArr.length - 2).join('.')
	},
	/**
	 * 设置 cookie（原生 JavaScript 实现）
	 * @param {string} cookieName - cookie 名称
	 * @param {string} value - cookie 值（会自动转为字符串）
	 * @param {Object} [options] - 可选配置（domain、path、expires、maxAge、secure、sameSite）
	 * @returns {void}
	 */
	setCookie(cookieName, value, options = {}) {
		// 1. 处理值（确保是字符串，进行编码避免特殊字符）
		let cookieValue = encodeURIComponent(String(value));

		// 2. 构建 cookie 字符串
		let cookieParts = [`${cookieName}=${cookieValue}`];

		// 3. 处理配置项
		const defaultDomain = window.utils.rootDomain(); // 假设 rootDomain() 是已实现的获取根域名的函数
		const {
			domain = defaultDomain, // 默认使用根域名
			path = '/', // 默认路径
			expires, // 过期日期（Date 对象）
			maxAge, // 最大存活时间（秒）
			secure = false, // 是否仅 HTTPS 传输
			sameSite = 'Lax' // 同源策略（Lax/Strict/None）
		} = options;

		// 添加域名
		if (domain) {
			cookieParts.push(`domain=${domain}`);
		}

		// 添加路径
		cookieParts.push(`path=${path}`);

		// 添加过期时间（expires 优先级低于 maxAge）
		if (maxAge) {
			cookieParts.push(`max-age=${maxAge}`);
		} else if (expires instanceof Date) {
			cookieParts.push(`expires=${expires.toUTCString()}`);
		}

		// 添加 secure 标志
		if (secure) {
			cookieParts.push('secure');
		}

		// 添加 sameSite 策略
		cookieParts.push(`samesite=${sameSite}`);

		// 5. 设置 cookie
		document.cookie = cookieParts.join('; ');
	},
	setToken (accessToken, tokenType) {
		let expires
		const TOKEN_EXPIRES_DAY = window?.parent?._env_?.TOKEN_EXPIRES_DAY || window?._env_?.TOKEN_EXPIRES_DAY
		if (!TOKEN_EXPIRES_DAY) {
			expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
		}

		if (Number(TOKEN_EXPIRES_DAY) > 0) {
			expires = new Date(Date.now() + Number(TOKEN_EXPIRES_DAY) * 24 * 60 * 60 * 1000)
		}
		const trans = {
			'access_token': window?._env_?.COOKIE_TOKEN_KEY || 'access_token',
			'token_type': window?._env_?.COOKIE_TOKENTYPE_KEY || 'token_type'
		}
		window.utils.setCookie(trans['access_token'], accessToken, { expires })
		window.utils.setCookie(trans['token_type'], tokenType, { expires })
	},
	/**
	 * 跳转页面
	 * @desc 传递iframe消息, 子发给父消息， 通过mark查找菜单对应的路径（path或iframe）
	 * @param menuMark 菜单标识（默认与pageCode一致）
	 * @param params 跳转参数，一个key/value对象
	 */
	redirectToPage(menuMark, params) {
		const isIframeOpen = window.frameElement && window.frameElement.tagName === 'IFRAME'
		const toQs = (obj) => {
			const searchParams = new URLSearchParams();
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					searchParams.append(key, obj[key]);
				}
			}
			return searchParams.toString() ? `?${searchParams.toString()}` : '';
		}
		if (isIframeOpen) {
			window.parent.postMessage({ menuMark, params })
		} else if (window.h && window.systemCode) {
			window.h.push(`/lowcodeRender/sys/${systemCode}/${menuMark}${toQs(params)}`)
		} else if (window._ICE_$_ROUTER_) {
			window._ICE_$_ROUTER_.push(`/${menuMark}${toQs(params)}`)
		} else {
            location.href = `/lowcodeRender/page/${appCode}/${menuMark}${toQs(params)}`
        }
	},

	/**
	 * 跳转地址
	 * @param 路径地址
	 */
	// 传递iframe消息, 子发给父消息, window.location
	redirectTo(path) {
		const isIframeOpen = window.frameElement && window.frameElement.tagName === 'IFRAME'
		if (isIframeOpen) {
			window.parent.postMessage({ path })
		} else {
			location.href = path
		}
	},

	/**
	 * 树转列表 treeToList
	 * @param treeData，树形数据
	 * @param childrenKey 默认值 children
	 * @return {node, level}，node为树节点，level为递归层级
	 */
	treeToList(treeData, childrenKey = 'children', level = 0) {
		const result = [];
		for (const node of treeData) {
			result.push({ node, level });
			if (node[childrenKey]) {
				result.push(...window.utils.treeToList(node[childrenKey], childrenKey, level + 1));
			}
		}
		return result;
	},

	/**
	 * 列表转树 listToTree
	 * @param listData 列表数据
	 * @param childrenKey 默认值 children
	 * @return 树形数据
	 */
	/**
	 * 将扁平列表转换为树形结构（基于 pid），自动识别根节点并计算 _level
	 * @param {Array} listData - 扁平列表，每个元素需包含 id 和 pid 字段
	 * @param {string} childrenKey - 子节点字段名，默认 'children'
	 * @returns {Array} 树形结构的根节点数组，每个节点包含 _level 字段
	 */
	listToTree(listData, options) {
		options = {}
		const {
			idKey = 'id',
			parentKey = 'pid',
			childrenKey = 'children'
		} = options;
		if (!Array.isArray(listData)) {
			throw new TypeError('listData is not an array');
		}
		if (typeof childrenKey !== 'string' || childrenKey === '') {
			throw new Error('childrenKey must be a non-empty string');
		}

		const map = new Map();
		const roots = [];

		// 第一步：初始化所有节点（浅拷贝 + 初始化 children 和 _level 占位）
		for (const item of listData) {
			if (item.id == null) {
				console.warn('Item missing id, skipped:', item);
				continue;
			}
			map.set(item.id, { ...item, [childrenKey]: [], _level: 0 });
		}

		// 第二步：建立父子关系，并收集根节点
		for (const item of listData) {
			if (item.id == null) continue;

			const node = map.get(item.id);
			const parentId = item.pid;

			// 判断是否为根节点：pid 为 null/undefined，或 pid 对应的节点不存在
			if (parentId == null || !map.has(parentId)) {
				roots.push(node);
			} else {
				const parent = map.get(parentId);
				parent[childrenKey].push(node);
			}
		}

		// 第三步：递归设置 _level（从根开始 DFS）
		function setLevel(nodes, currentLevel) {
			for (const node of nodes) {
				node._level = currentLevel;
				if (node[childrenKey] && node[childrenKey].length > 0) {
					setLevel(node[childrenKey], currentLevel + 1);
				}
			}
		}
		setLevel(roots, 0);

		return roots;
	},

	/**
	 * 遍历树 treeMap
	 * @param treeData 树形数据
	 * @param mapFn 映射规则
	 * @param childrenKey 默认值 children
	 * @return 映射后的树形数据
	 */
	treeMap(treeData, mapFn, childrenKey = 'children') {
		const newTree = []
		for (let i = 0; i < treeData.length; i++) {
			const node = treeData[i]
			const children = node[childrenKey]
			const newNode = { ...mapFn(node) }
			if (children) {
				newNode.children = window.utils.treeMap(children, mapFn, childrenKey)
			}
			newTree.push(newNode)
		}
		return newTree;
	},

	/**
	 * 遍历 tree
	 * @param {object[]} tree
	 * @param {function} cb - 回调函数
	 * @param {string} children - 子节点 字段名
	 * @param {string} mode - 遍历模式，DFS：深度优先遍历 BFS：广度优先遍历
	 * @return {void} Do not return anything
	 */
	treeForEach(tree, cb, children = 'children', mode = 'DFS') {
		if (!Array.isArray(tree)) {
			throw new TypeError('tree is not an array')
		}
		if (typeof children !== 'string') {
			throw new TypeError('children is not a string')
		}
		if (children === '') {
			throw new Error('children is not a valid string')
		}

		// 深度优先遍历 depth first search
		function DFS(tree) {
			for (const item of tree) {
				cb(item)

				if (Array.isArray(item[children])) {
					DFS(item[children])
				}
			}
		}

		// 广度优先遍历 breadth first search
		function BFS(tree) {
			const queen = tree

			while (queen.length > 0) {
				const item = queen.shift()

				cb(item)

				if (Array.isArray(item[children])) {
					queen.push(...item[children])
				}
			}
		}

		mode === 'BFS' ? BFS(tree) : DFS(tree)
	},

	/**
	 * 过滤树 treeFilter
	 * @param treeData, 树形数据
	 * @param filterFn(node)，过滤方法
	 * @param childrenKey 默认值 children
	 * @return newTree
	 */
	treeFilter(treeData, filterFn, childrenKey = 'children') {
		const newTree = [];
		for (let i = 0; i < treeData.length; i++) {
			const node = treeData[i];
			const children = node[childrenKey];
			if (filterFn(node)) {
				const newNode = { ...node };
				if (children) {
					newNode.children = window.utils.treeFilter(children, filterFn, childrenKey);
				}
				newTree.push(newNode);
			} else if (children) {
				const filteredChildren = window.utils.treeFilter(children, filterFn, childrenKey);
				if (filteredChildren.length > 0) {
					const newNode = { ...node, children: filteredChildren };
					newTree.push(newNode);
				}
			}
		}
		return newTree;
	},

	/**
	 * getCookie
	 */
	getCookie() {
		const cookies = document.cookie.split(';');
		const cookieObj = {};

		cookies.forEach((cookie) => {
			const [name, value] = cookie.trim().split('=');
			cookieObj[name] = decodeURIComponent(value);
		});

		return cookieObj;
	},

	/**
	 * getAuthorization
	 */
	getAuthorization() {
		const cookieObj = window.utils.getCookie()
		// 在低代码渲染器中，独立渲染有window._env_;单页渲染没有window._env_，优先读取parent的window._env_
		const COOKIE_TOKEN_KEY = window?.parent?._env_?.COOKIE_TOKEN_KEY || window?._env_?.COOKIE_TOKEN_KEY
		const COOKIE_TOKENTYPE_KEY = window?.parent?._env_?.COOKIE_TOKENTYPE_KEY || window?._env_?.COOKIE_TOKENTYPE_KEY
		const accessToken = cookieObj[COOKIE_TOKEN_KEY || 'access_token']
		const tokenType = cookieObj[COOKIE_TOKENTYPE_KEY || 'token_type']
		return accessToken && tokenType ? `${tokenType} ${accessToken}` : ''
	},

	/**
	 * 处理数据源请求成功逻辑
	 * 1、登出逻辑
	 */
	handleRequestSuccess({ data:res }) {
		const {code} = res
		const isIframeOpen = window.frameElement && window.frameElement.tagName === 'IFRAME'
		if(code == 401) {
			if(isIframeOpen) {
				window.parent.location.href == `/platform-manage/login?fromUrl=${encodeURIComponent(location.href)}`
			} else {
				window.location.href = `/platform-manage/login?fromUrl=${encodeURIComponent(location.href)}`
			}
		}
	},

	/**
	 * 处理数据源插件请求异常
	 */
	handleRequestError(err) {
		console.log("handleRequestError", err)
	},

	/**
	 * 设置表单容器完整字段
	 * 根据refName同时设置表单变量及state变量
	 */
	async setFields(_this, formRefNameAndStateName, formData = {}, customStateName = '') {
		const formRefName = formRefNameAndStateName;
		const formStateName = customStateName || formRefName;
		await _this.setState(state => {
			state[formStateName] = {
				...state[formStateName],
				...formData
			};
			return state;
		});
		setTimeout(() => {
			_this.$(formRefName).setFieldsValue(formData);
		}, 100);
	},
	/**
	 * 设置单个字段
	 * 根据refName同时设置表单变量及state变量
	 */
	async setField(_this, formRefNameAndStateName, namePathArray, value, customStateName = null) {
		const formRefName = formRefNameAndStateName;
		const formStateName = customStateName || formRefName;
		_this.$(formRefName).setFieldValue(namePathArray, value);
		setTimeout(() => {
			_this.setState(state => {
				_.set(state[formStateName], namePathArray, value)
				return state;
			});
		}, 100);
	},

	/**
	 * 获取所有请求入参对象
	 */
	getUrlParams() {
		const urlParams = new URLSearchParams(`?${window.location.href.split('?')[1]}`);
		// 获取迭代器对象
		const iterator = urlParams.entries();
		// 使用迭代器遍历所有键值对并将其转换为对象
		const paramsObject = {};
		for (const [key, value] of iterator) {
			paramsObject[key] = value;
		}
		return paramsObject
	},

	/**
	 * 替换URL参数
	 * @param params 添加或替换的参数对象
	 * @param url 替换参数的url地址，默认为当前页面地址
	 */
	replaceUrlParams(params, url = window.location.href) {
		if (typeof params !== 'object' || params === null) {
			return
		}
		const urlObj = new URL(url)
		// 更新或添加新参数
		Object.entries(params).forEach(([key, value]) => {
			urlObj.searchParams.set(key, value)
		})
		window.history.replaceState({}, '', urlObj.toString())
	},

	/**
	 * 防抖触发事件
	 * @param key 防抖函数标识，确保全局唯一
	 * @param values 防抖函数中动态传入的变量，在func回调中获得
	 * @param func 需要防抖并执行的函数
	 * @param time 防抖时间，单位毫秒
	 * @param that 页面this实例，独立应用渲染场景需传此参数。
	 */
	async debounce(key, values, func, time = 200, that = null) {
		const target = that || window
		if (!target?.debounceFuncs) {
			target.debounceFuncs = {}
		}
		if (!target?.debounceFuncs[key] || target?.debounceFuncs[key].toString() != _.debounce(func, time).toString()) {
			target.debounceFuncs[key] = _.debounce(func, time)
		}
		await target.debounceFuncs[key](values)
	},

	/**
	 * 下载文件方法
	 * @param 下载地址
	 * @param 下载文件名称（含后缀）
	 * @param 请求头（传入token 等..）
	 */
	downloadFile(url, localFilename, headers = {}) {
		fetch(url, {
			method: 'POST',
			headers: {
				...headers
			}
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.blob();
			})
			.then(blobData => {
				const url = window.URL.createObjectURL(new Blob([blobData]));
				const a = document.createElement('a');
				a.href = url;
				a.download = localFilename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
				console.log(`文件下载完成: ${localFilename}`);
			})
			.catch(error => {
				console.error(`下载文件时发生错误: ${error.message}`);
			});
	},

	/**
	 * 引入远程js
	 * @param src 远程js umd文件地址
	 * @param id script标签id，可选（可用于后续dom删除）
	 */
	loadJs(src, id = '', isAsync = false) {
		return new Promise((resolve, reject) => {
			let doc = window.utils.isDesignMode() ? window.frames['SimulatorRenderer'].document : document
			let scriptDom = doc.getElementById(id)
			if (!scriptDom) {
				let script = doc.createElement('script');
				script.id = id;
				script.type = "text/javascript";
				script.src = src;
				if (isAsync) script.async = true
				script.onload = () => {
					resolve();
				}
				script.onerror = (e) => {
					console.error(e)
					reject();
				}
				doc.body.appendChild(script);
			} else {
				resolve()
			}
		})
	},

	/**
	 * 引入远程js module模块
	 * @param moduleName 引入的module模块名
	 * @param src 远程js umd文件地址
	 * @param id script标签id，可选（可用于后续dom删除）
	 */
	loadJsModule(moduleName, src, id = '') {
		return new Promise((resolve, reject) => {
			// doc永远指向顶级的doc，因此：1. 在设计态时需取name=SimulatorRenderer的容器；2. 在运行态则直接取doc
			let doc = window.utils.isDesignMode() ? window.frames['SimulatorRenderer'].document : document
			if (!doc.getElementById(id)) {
				let script = doc.createElement('script');
				script.id = moduleName || id;
				script.type = "module";
				script.textContent = `
		import ${moduleName} from "${src}";
		window.${moduleName} = ${moduleName};
					`;
				doc.body.appendChild(script);
				// type为module的script，有可能不会触发onload
				script.onload = () => {
					resolve();
				}
				// type为module的script，有可能不会触发onerror
				script.onerror = (e) => {
					console.error(e)
					reject();
				}
				// 如果模块已经被加载并且在全局范围内可用，直接 resolve
				if (window[moduleName]) {
					resolve();
				} else {
					// 如果在加载过程中没有立刻可用，使用定时器检查
					const checkModuleLoaded = setInterval(() => {
						if (window[moduleName]) {
							clearInterval(checkModuleLoaded);
							resolve();
						}
					}, 100);
				}
			}
		})
	},

	/**
	 * 检测js已加载成功，若不成功可控制刷新页面走缓存
	 * condition: 检测条件
	 * reloadTime: 等待多少ms刷新页面，0为不刷新页面一直等待
	 */
	checkJsLoaded(condition, reloadTime = 0) {
		return new Promise((resolve) => {
			if (window.utils.isDesignMode()) {
				resolve()
				return
			}
			const time = 100 //100ms检测一次
			let start = 0
			const hideLoading = window.antd.message.loading()
			const intervalId = setInterval(() => {
				start += time
				console.log(`checkJsLoaded wait: ${start}ms`)
				if (condition) {
					clearInterval(intervalId);
					hideLoading()
					resolve();
				}
				if (reloadTime != 0 && start >= reloadTime) {
					start = 0
					location.reload()
				}
			}, time);
		});
	},

	/**
	 * 引入远程css
	 * @param src 远程css umd文件地址
	 * @param id link标签id，可选（可用于后续dom删除）
	 */
	loadCss(src, id = '') {
		return new Promise(async (resolve, reject) => {
			if (!document.getElementById(id)) {
				let container = document.getElementsByTagName("head")[0];
				let link = document.createElement('link');
				link.id = id;
				link.rel = "stylesheet";
				link.type = "text/css";
				link.href = src;
				container.appendChild(link);

				link.onload = () => {
					resolve();
				}
				link.onerror = () => {
					reject();
				}
			}
		})
	},

	/**
	 * 是否为设计态页面
	 */
	isDesignMode() {
		return window.location.pathname === '/lowcodeDesigner/design.html'
	},
	/**
	 * 是否为预览页面
	 */
	isPreviewMode() {
		return window.location.href.includes('/lowcodeDesigner/preview/')
	},
	/**
	 * 拷贝文字至剪切板
	 */
	copyText(text = '') {
		if (navigator.clipboard && window.isSecureContext) {
			// 使用现代的 Clipboard API
			return navigator.clipboard.writeText(text).then(() => {
				console.log('Text copied to clipboard');
			}).catch(err => {
				console.error('Failed to copy text: ', err);
			});
		} else {
			// 回退到 document.execCommand 方法
			let textArea = document.createElement("textarea");
			textArea.value = text;

			// 避免 textarea 被显示
			textArea.style.position = "fixed";
			textArea.style.opacity = "0";
			textArea.style.left = "-9999px";

			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				document.execCommand('copy');
				console.log('Text copied to clipboard');
			} catch (err) {
				console.error('Failed to copy text: ', err);
			}

			document.body.removeChild(textArea);
		}
	},
	/**
	 * 替换字符串占位符{a}
	 */
	replacePlaceholders(inputString = '', placeholders = {}) {
		return inputString.replace(/({\w+})/g, (match, key) => {
			return placeholders[key.replace(/{|}/g, '')] || match;
		});
	},
	/**
	 * iframe子页面1 向 iframe子页面2 发送消息、前提条件，两个页面需同时存活
	 * @param framePageMark 目标页面标识
	 * @param data 消息体
	 */
	postFramesMessage(framePageMark, data) {
		if (!framePageMark || !data) {
			return
		}
		const framesLen = window.parent.frames.length
		let findIndex = -1
		for (let i = 0; i < framesLen; i++) {
			const frame = window.parent.frames[i]
			if (frame.location.pathname.endsWith(`/${framePageMark}`)) {
				findIndex = i
			}
		}
		// 发送消息
		window.parent.frames[findIndex]?.postMessage(data)
	},

	/**
	 * @param callback 监听到消息的回调
	 */
	useFramesMessage(callback) {
		const pathname = window.location.pathname
		window.addEventListener('message', function (event) {
			const frame = event.target
			if (frame.location.pathname === pathname) {
				callback(event.data)
			}
		})
	},
	/**
	 * 手动关闭系统级渲染下的 tab页签，同时也会清除页面缓存。
	 * @param menuMarks 页面标识的数组，或单个字符串
	 */
	closeMenuTabs(menuMarks) {
		try {
			const marks = []
			if (Array.isArray(menuMarks)) {
				marks.push(...menuMarks)
			} else {
				marks.push(menuMarks)
			}
			// 判断是否有tabs实例
			if (window._render_tabs_ref) {
				// 获取tabs 缓存
				const caches = JSON.parse(localStorage.getItem("_tabs_cache"))
				const relTabs = caches.map(c => c.key).filter(k => marks.includes(k.split("/").at(-1)))
				window._render_tabs_ref.remove?.(relTabs)
			}
		} catch {
			console.warn("close tabs error")
		}
	},

	/**
	 * 设置当前页面的 title 和 description，用于SEO
	 * @param {string} newTitle - 新的页面标题
	 * @param {string} newDescription - 新的页面描述
	 */
	setPageMeta(newTitle, newDescription) {
		if (newTitle) {
			document.title = newTitle;
		}
		if (newDescription) {
			let descriptionMeta = document.querySelector('meta[name="description"]');
			if (!descriptionMeta) {
				descriptionMeta = document.createElement('meta');
				descriptionMeta.name = 'description';
				document.head.appendChild(descriptionMeta);
			}
			descriptionMeta.content = newDescription;
		}
	}

}

// google统计
if (location.host == 'www.lowcodestudio.cn') {
	window.utils.loadJs("https://www.googletagmanager.com/gtag/js?id=G-BZ2SLFGFNK", 'google-anylasys', true)
	window.dataLayer = window.dataLayer || [];
	function gtag() { dataLayer.push(arguments); }
	gtag('js', new Date());
	gtag('config', 'G-BZ2SLFGFNK', {
		'content_group': appCode
	});
}

