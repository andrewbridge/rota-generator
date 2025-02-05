import { computed, persistRef, ref } from "../deps/vue.mjs";
import { getUid } from "../utilities/string.mjs";

export const AVOIDANCE_RULES = {
    NONE: 'NONE',
    AVOID_CONSECUTIVE_ROLES: 'AVOID_CONSECUTIVE_ROLES',
    AVOID_CONSECUTIVE_SHIFTS: 'AVOID_CONSECUTIVE_SHIFTS',
    AVOID_DUPLICATE_SHIFTS: 'AVOID_DUPLICATE_SHIFTS',
};

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
    value.push({ id: getUid(), name: '', days: [] });
    rotaMembers.value = value;
};
export const removeRotaMember = (id) => {
    const { value } = rotaMembers;
    value.splice(rotaMembers.value.findIndex(({ id: needleId }) => needleId === id), 1);
    rotaMembers.value = value;
};
if (rotaMembers.value.length === 0) addRotaMember();

export const rotaRoles = ref([]);
persistRef(rotaRoles, 'ROTA_GENERATOR_ROLES', true);
export const roleMap = computed(() => {
    const map = new Map();
    for (const rotaRole of rotaRoles.value) {
        map.set(rotaRole.id, rotaRole);
    }
    return map;
});
export const addRotaRole = () => {
    const { value } = rotaRoles;
    value.push({ id: getUid(), name: '', members: [], requiredPerDay: 1 });
    rotaRoles.value = value;
};
export const removeRotaRole = (id) => {
    const { value } = rotaRoles;
    value.splice(rotaRoles.value.findIndex(({ id: needleId }) => needleId === id), 1);
    rotaRoles.value = value;
};
if (rotaRoles.value.length === 0) addRotaRole();

export const avoidanceRule = ref(AVOIDANCE_RULES.NONE);
persistRef(avoidanceRule, 'ROTA_GENERATOR_AVOIDANCE_RULE', true);

export const numberOfWeeks = ref(1);
persistRef(numberOfWeeks, 'ROTA_GENERATOR_NUMBER_OF_WEEKS', true);