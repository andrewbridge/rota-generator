import { computed, persistRef, ref } from "../deps/vue.mjs";

export const rotaMembers = ref([]);
persistRef(rotaMembers, 'ROTA_GENERATOR_MEMBERS', true);
export const memberMap = computed(() => {
    const map = new Map();
    for (const rotaMember of rotaMembers.value) {
        map.set(rotaMember.id, rotaMember);
    }
    return map;
});
export const attendeeHourlyCost = computed(() => {
    const map = new Map();
    for (const attendee of rotaMembers.value) {
        const { id, salary, workDays, workHours, holidayDays } = attendee;
        const yearlyHours = ((workDays * 52) - holidayDays) * workHours;
        const hourlyRate = salary / yearlyHours;
        map.set(id, hourlyRate);
    }
    return map;
});
export const addRotaMember = () => {
    const { value } = rotaMembers;
    value.push({ id: Date.now().toString(), name: '', days: [] });
    rotaMembers.value = value;
};
export const removeRotaMember = (id) => {
    const { value } = rotaMembers;
    value.splice(rotaMembers.value.findIndex(({ id: needleId }) => needleId === id), 1);
    rotaMembers.value = value;
};
if (rotaMembers.value.length === 0) addRotaMember();

