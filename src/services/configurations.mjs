export const configurations = ref([]);
persistRef(configurations, 'ROTA_GENERATOR_CONFIGURATIONS', true);



export const roleMap = computed(() => {
    const map = new Map();
    for (const rotaRole of configurations.value) {
        map.set(rotaRole.id, rotaRole);
    }
    return map;
});
export const addRotaRole = () => {
    const { value } = configurations;
    value.push({ id: getUid(), name: '', members: [], requiredPerDay: 1 });
    configurations.value = value;
};
export const removeRotaRole = (id) => {
    const { value } = configurations;
    value.splice(configurations.value.findIndex(({ id: needleId }) => needleId === id), 1);
    configurations.value = value;
};