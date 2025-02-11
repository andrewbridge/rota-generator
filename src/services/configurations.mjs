import { AVOIDANCE_RULES } from "../constants.mjs";
import { computed, persistRef, ref } from "../deps/vue.mjs";
import { ConfigurationExistsError } from "../errors.mjs";
import { compress, decompress } from "../utilities/modelCompression.mjs";
import { getUid } from "../utilities/string.mjs";

/** 
 * @template T
 * @typedef {import("../types").Vue.Ref<T>} Ref<T>
 * */

/** @typedef {import('../types').Configuration} Configuration */

/** @type {Ref<Configuration[]>} */
export const configurations = ref([]);
persistRef(configurations, 'ROTA_GENERATOR_CONFIGURATIONS', true);
/** @type {Ref<Map<string, Configuration>>} */
export const configurationMap = computed(() => {
    const map = new Map();
    for (const configuration of configurations.value) {
        map.set(configuration.uid, configuration);
    }
    return map;
});

const replaceConfiguration = (id, ...replacementConfigurations) => {
    const { value } = configurations;
    value.splice(configurations.value.findIndex(({ uid: needleId }) => needleId === id), 1, ...replacementConfigurations);
    configurations.value = value;
}

/** @type {(configuration?: Configuration) => void} */
export const addConfiguration = (configuration) => {
    const { value } = configurations;
    const finalConfiguration = {
        uid: getUid(),
        name: '',
        members: [],
        roles: [],
        avoidanceRule: AVOIDANCE_RULES.NONE,
        numberOfWeeks: 1,
    };
    if (configuration) {
        Object.assign(finalConfiguration, configuration);
    }
    if (configurationMap.value.has(finalConfiguration.uid)) {
        replaceConfiguration(finalConfiguration.uid, finalConfiguration);
    } else {
        value.push(finalConfiguration);
    }
    configurations.value = value;
};
export const addConfigurationFromShare = async (shareData, overwrite = false) => {
    const { value } = configurations;
    const decompressedConfiguration = await decompress(shareData);
    const configurationExists = configurationMap.value.has(decompressedConfiguration.uid)
    if (configurationExists && overwrite !== true) {
        throw new ConfigurationExistsError();
    } else if (configurationExists && overwrite === true) {
        const existingConfiguration = configurationMap.value.get(decompressedConfiguration.uid);
        Object.assign(existingConfiguration, decompressedConfiguration);
    } else {
        value.push(decompressedConfiguration);
    }
    configurations.value = value;
};
export const shareConfiguration = (id) => {
    const { value } = configurations;
    const configuration = value.find(({ uid: needleId }) => needleId === id);
    return compress(configuration);
};
export const removeConfiguration = (id) => replaceConfiguration(id);