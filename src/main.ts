import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
// AG Grid community modules registration (required for ag-grid-vue3)
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([ AllCommunityModule ])
import { HomeOutlined, AppstoreOutlined, UserOutlined, MoneyCollectOutlined, SettingOutlined, ToolOutlined, TeamOutlined, BarChartOutlined, WechatOutlined, DatabaseOutlined, ApartmentOutlined, ShopOutlined, BankOutlined, FileTextOutlined, WalletOutlined, PayCircleOutlined, DashboardOutlined, ReadOutlined, CalendarOutlined, LockOutlined, CustomerServiceOutlined, ExclamationCircleOutlined, PieChartOutlined, LinkOutlined, BellOutlined, UserAddOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { LoginOutlined, LogoutOutlined, DownOutlined, IdcardOutlined } from '@ant-design/icons-vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Antd)
app.component('HomeOutlined', HomeOutlined)
app.component('AppstoreOutlined', AppstoreOutlined)
app.component('UserOutlined', UserOutlined)
app.component('MoneyCollectOutlined', MoneyCollectOutlined)
app.component('SettingOutlined', SettingOutlined)
app.component('ToolOutlined', ToolOutlined)
app.component('TeamOutlined', TeamOutlined)
app.component('BarChartOutlined', BarChartOutlined)
app.component('WechatOutlined', WechatOutlined)
app.component('DatabaseOutlined', DatabaseOutlined)
app.component('HomeFilled', HomeOutlined)
app.component('DatabaseFilled', DatabaseOutlined)
app.component('UserFilled', UserOutlined)
app.component('MoneyCollectFilled', MoneyCollectOutlined)
app.component('SettingFilled', SettingOutlined)
app.component('ToolFilled', ToolOutlined)
app.component('TeamFilled', TeamOutlined)
app.component('BarChartFilled', BarChartOutlined)
app.component('WechatFilled', WechatOutlined)
app.component('AppstoreFilled', AppstoreOutlined)
app.component('ApartmentOutlined', ApartmentOutlined)
app.component('ShopOutlined', ShopOutlined)
app.component('BankOutlined', BankOutlined)
app.component('FileTextOutlined', FileTextOutlined)
app.component('WalletOutlined', WalletOutlined)
app.component('PayCircleOutlined', PayCircleOutlined)
app.component('DashboardOutlined', DashboardOutlined)
app.component('ReadOutlined', ReadOutlined)
app.component('CalendarOutlined', CalendarOutlined)
app.component('LockOutlined', LockOutlined)
app.component('CustomerServiceOutlined', CustomerServiceOutlined)
app.component('ExclamationCircleOutlined', ExclamationCircleOutlined)
app.component('PieChartOutlined', PieChartOutlined)
app.component('LinkOutlined', LinkOutlined)
app.component('BellOutlined', BellOutlined)
app.component('UserAddOutlined', UserAddOutlined)
app.component('CheckCircleOutlined', CheckCircleOutlined)
app.component('SearchOutlined', SearchOutlined)
app.component('LoginOutlined', LoginOutlined)
app.component('LogoutOutlined', LogoutOutlined)
app.component('DownOutlined', DownOutlined)
app.component('IdcardOutlined', IdcardOutlined)

app.mount('#app')

// 全局运行时错误捕获（方便在开发时定位运行时异常）
if (typeof window !== 'undefined') {
	window.addEventListener('error', (ev) => {
		try {
			// _VERBOSE: include full event and error object for debugging, but serialize important fields
			try { console.error('Full ErrorEvent (object):', ev) } catch (e) {}
			try {
				const evJson: any = {
					message: ev.message,
					filename: (ev as any).filename,
					lineno: (ev as any).lineno,
					colno: (ev as any).colno,
					errorName: (ev as any).error?.name,
					errorMessage: (ev as any).error?.message,
					errorStack: (ev as any).error?.stack
				}
				console.error('Full ErrorEvent JSON:', JSON.stringify(evJson, null, 2))
			} catch (e) { try { console.error('Failed to stringify ErrorEvent', e) } catch (e) {} }

			const info = {
				message: ev.message || (ev as any).error?.message || 'unknown',
				stack: (ev as any).error?.stack || '',
				time: Date.now(),
				filename: (ev as any).filename || '',
				lineno: (ev as any).lineno || 0,
				colno: (ev as any).colno || 0,
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
			}
			try { console.error('GlobalError JSON:', JSON.stringify(info, null, 2)) } catch (e) { console.error('GlobalError (raw):', info) }
			try { localStorage.setItem('__last_global_error__', JSON.stringify(info)) } catch (e) {}
		} catch (e) {}
	})
	window.addEventListener('unhandledrejection', (ev) => {
		try {
			// _VERBOSE: include full event for debugging, serialize reason
			try { console.error('Full UnhandledRejection (object):', ev) } catch (e) {}
			try {
				const reason = (ev as any).reason
				const rjson = { message: reason?.message || String(reason), stack: reason?.stack || '', time: Date.now() }
				console.error('UnhandledRejection JSON:', JSON.stringify(rjson, null, 2))
				try { localStorage.setItem('__last_unhandled_promise__', JSON.stringify(rjson)) } catch (e) {}
			} catch (e) { try { console.error('Failed to stringify unhandledrejection', e) } catch (e) {} }
		} catch (e) {}
	})
}
