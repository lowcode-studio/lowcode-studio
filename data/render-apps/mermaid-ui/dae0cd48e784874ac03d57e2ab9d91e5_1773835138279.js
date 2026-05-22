window.constants = {

    apiBaseUrl: '/lapi/mermaid-ui-server/v0',

    // 动作元信息
    actionMap: {
        // 声明时序图对象
        object: {
            template: (props) => {
                const { type, name, desc } = props
                if(desc) {
                    return `${type} ${name} as ${desc}`
                } else {
                    return `${type} ${name}`
                }
            }
        },
        // 流程动作
        logic: {
            template: (props) => {
                const { from, to, type, desc } = props
                return `${from} ${type} ${to}: ${desc || '..'}`
            }
        },
        // 备注动作
        note: {
            template: (props) => {
                const { direction, desc, objects=[] } = props
                if(objects.length > 1) {
                    return `note over ${objects.join(',')}: ${desc || '..'}`
                } else if(objects.length == 1) {
                    return `note ${direction} of ${objects[0]}: ${desc || '..'}`
                }
            }
        },
        // 自定义代码
        custom: {
            template: (props) => {
                const {code} = props
                return code
            }
        }
    }

}