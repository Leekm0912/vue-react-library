import { defineComponent, h } from "vue"
import { greet } from '../core'

export const GreetComponent = defineComponent({
    props: {
        name: {
            type: String,
            required: true
        }
    },
    setup(props) {
        // core 함수의 결과를 Vue 렌더링 함수(h)를 통해 표시
        return () => h('div', greet(props.name))
    }
})