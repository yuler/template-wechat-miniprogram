import mitt from 'mitt'

const emitter = mitt()

export interface IApp {
	$system?: MP.SystemInfo

	$log: typeof $log
	$request: typeof $request

	$events: typeof emitter.all
	$on: typeof emitter.on
	$emit: typeof emitter.emit

	debug: boolean
	gloablData: any
}

App<IApp>({
	// Store System info
	$system: undefined,

	// Helper functions
	$log,
	$request,

	// Events
	$events: emitter.all,
	$on: emitter.on,
	$emit: emitter.emit,

	// Global state & data
	debug: false,
	gloablData: {},

	onLaunch() {
		/**
		 * Save system info to `$system`
		 * @url https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getSystemInfo.html
		 */
		wx.getSystemInfo()
			.then(data => {
				this.$system = data
			})
			.catch(_ => {})

		/**
		 * Event emit to `home` page
		 * @example events
		 */
		setInterval(() => {
			this.$emit('app:tick', 'tick')
		}, 1000)
	},
})

/**
 * Wrap `console.log` with debug mode
 */
function $log(this: IApp, namespace: string, ...args: unknown[]) {
	getApp<IApp>().debug && console.log(`[${namespace}]: `, ...args)
}

/**
 * Wrap function for `wx.request`
 * @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
 */
function $request<T = any>(
	url: string,
	options: Omit<MP.RequestOption, 'url'>,
	requestTask?: MP.RequestTask,
): Promise<T> {
	return new Promise((resolve, reject) => {
		const _requestTask = wx.request<T>({
			url,
			timeout: 2000,
			header: {
				// TODO: replace to package.version
				version: '0.0.0',
			},
			success(result) {
				// Success
				if (result.statusCode >= 200 && result.statusCode < 300) {
					resolve(result.data)
				}
				reject(result)
			},
			fail: reject,
			...options,
		})
		if (requestTask) requestTask = _requestTask
	})
}
