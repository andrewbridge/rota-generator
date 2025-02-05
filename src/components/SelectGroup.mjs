import { getUid } from "../utilities/string.mjs";

export default {
    name: 'SelectGroup',
    emits: ['update:modelValue'],
    props: {
        items: {
            type: Array,
            required: true
        },
        modelValue: {
            type: Array,
            required: false,
            default: () => []
        },
        name: {
            type: String,
            required: false
        },
        title: {
            type: String,
            required: false
        }
    },
    data: () => ({ generatedName: getUid() }),
    computed: {
        elementName() {
            return this.name || this.generatedName;
        },
        dataIsArray() {
            return Array.isArray(this.items);
        }
    },
    methods: {
        handleChange(checked, item) {
            const newValue = checked ? [...this.modelValue, item] : this.modelValue.filter(i => i !== item)
            console.log(newValue);
            this.$emit('update:modelValue', newValue);
        },
        getItemId(item, key) {
            return this.dataIsArray ? item : key;
        }
    },
    template: /*html*/`
        <label class="form-label" v-if="title" :for="elementName">{{title}}</label>
        <div class="form-selectgroup">
            <label class="form-selectgroup-item" v-for="(item, key) in items" :key="item">
                <input type="checkbox" 
                    :name="elementName" 
                    :value="getItemId(item, key)" 
                    :checked="modelValue.includes(getItemId(item, key))"
                    @change="handleChange($event.target.checked, getItemId(item, key))"
                    class="form-selectgroup-input">
                <span class="form-selectgroup-label">{{item}}</span>
            </label>
        </div>`
};