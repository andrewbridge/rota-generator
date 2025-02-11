export { createApp, ref, reactive, h, watchEffect, watch, computed, shallowReactive } from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js';
import { watchEffect, ref } from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js';

export const mapRefs = (refs, readonly = true) => {
    const mappedRefs = {};
    for ( const refName in refs) {
        const getter = () => refs[refName].value;
        mappedRefs[refName] = readonly ? getter : {
            get: getter,
            set: (value) => refs[refName].value = value,
        };
    }
    return mappedRefs;
}

export const persistRef = (ref, persistKey, permanently = false) => {
    const storage = permanently ? window.localStorage : window.sessionStorage;
    if (persistKey in storage) {
        ref.value = JSON.parse(storage.getItem(persistKey));
    }
    watchEffect(() => storage.setItem(persistKey, JSON.stringify(ref.value)));
}
