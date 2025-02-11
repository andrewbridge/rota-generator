import { computed, persistRef, ref, watch } from "../deps/vue.mjs";
import { InvalidConfigurationError, NoConfigurationError } from "../errors.mjs";
import { generateRotas } from "../utilities/rotaGenerator.mjs";
import { configurations, configurationMap } from "./configurations.mjs";

/** 
 * @template T
 * @typedef {import("../types").Vue.Ref<T>} Ref<T>
 * */

/**
 * @typedef {import("../types").Configuration} Configuration
 * @typedef {import("../types").Rota} Rota
 */

/** @type {Ref<number | null>} */
export const selectedConfigurationUid = ref(null);
persistRef(selectedConfigurationUid, 'ROTA_GENERATOR_SELECTED_CONFIGURATION_UID', true);

watch([configurations, configurationMap], () => {
    if ((selectedConfigurationUid.value === null || !configurationMap.value.has(selectedConfigurationUid.value)) && configurations.value.length > 0) {
        selectedConfigurationUid.value = configurations.value[0].uid;
    }
}, { immediate: true });

/** @type {Ref<Configuration>} */
export const selectedConfiguration = computed(() => {
    if (typeof selectedConfigurationUid.value !== 'string' || !configurationMap.value.has(selectedConfigurationUid.value)) {
        return null;
    }
    return configurationMap.value.get(selectedConfigurationUid.value)
});

/** @type {Ref<Rota[] | null>} */
export const generatedRotas = ref(null);
persistRef(generatedRotas, 'ROTA_GENERATOR_GENERATED_ROTAS', true);

watch(selectedConfigurationUid, (newValue, oldValue) => {
    if (typeof oldValue === 'string' && oldValue !== newValue && !configurationMap.value.has(oldValue)) {
        generatedRotas.value = null;
    }
});

export const generateRotasFromSelectedConfiguration = () => {
    if (selectedConfiguration.value === null) {
        throw new NoConfigurationError();
    }
    const { members, roles } = selectedConfiguration.value;
    if (members.length === 0 || roles.length === 0) {
        throw new InvalidConfigurationError();
    }
    generatedRotas.value = generateRotas(selectedConfiguration.value);
};