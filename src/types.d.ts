declare namespace Vue {
    export interface Ref<T = any> {
        value: T
    }
}

export type Member = { id: string; name: string; days: number[] };
export type Role = { id: string; name: string; members: Member[]; requiredPerDay: number };
export enum AVOIDANCE_RULES {
    NONE = 'NONE',
    AVOID_CONSECUTIVE_ROLES = 'AVOID_CONSECUTIVE_ROLES',
    AVOID_CONSECUTIVE_SHIFTS = 'AVOID_CONSECUTIVE_SHIFTS',
    AVOID_DUPLICATE_SHIFTS = 'AVOID_DUPLICATE_SHIFTS',
};
export type Configuration = {
    uid: string;
    name: string;
    members: Member[];
    roles: Role[];
    avoidanceRule: AVOIDANCE_RULES;
    numberOfWeeks: number;
};
export type DAYS = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type MemberAllocation = {
    [key: string]: string
}
export type Rota = {
    [key in DAYS]: MemberAllocation
}