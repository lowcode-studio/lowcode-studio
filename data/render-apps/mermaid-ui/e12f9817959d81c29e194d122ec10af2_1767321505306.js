window.constants = {
	...JSON.parse(window.sessionStorage.getItem('constants')),
    appCode: appCode,
	theme: {
        primaryColor: '#1740DC',
        successColor: '#52c41a',
        warningColor: '#faad14',
        errorColor: '#f5222d',
    },
}