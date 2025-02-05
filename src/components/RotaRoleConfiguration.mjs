import { addRotaRole, rotaRoles, rotaMembers, removeRotaRole } from "../services/data.mjs";
import SelectGroup from "./SelectGroup.mjs";

export default {
    name: 'RotaRoleConfiguration',
    components: { SelectGroup },
    data: () => ({ rotaRoles, rotaMembers }),
    computed: {
        memberOptions() {
            const memberMap = {};
            for (const member of this.rotaMembers) {
                memberMap[member.id] = member.name;
            }
            return memberMap;
        },
        memberCount() {
            return this.rotaMembers.length;
        }
    },
    methods: {
        addRotaRole,
        removeRotaRole,
        areAllMembersSelected(rotaRole) {
            return rotaRole.members.length === this.memberCount;
        },
        toggleSelectAllMembers(rotaRole) {
            rotaRole.members = this.areAllMembersSelected(rotaRole) ? [] : this.rotaMembers.map(member => member.id);
        }
    },
    template: /*html*/`
        <label class="form-label required">Roles in rota</label>
        <fieldset class="form-fieldset row justify-content-center g-2 mb-3" v-for="(rotaRole, index) in rotaRoles" :key="rotaRole.id">
            <div class="col-11">
                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label required" :for="'role-name-' + rotaRole.id">Role name</label>
                        <input type="text" class="form-control" :class="{ 'is-invalid': rotaRole.name === '' }" :name="'role-name-' + rotaRole.id" placeholder="Name" v-model="rotaRole.name" required />
                    </div>
                    <div class="col-6">
                        <label class="form-label required" :for="'role-required-number-' + rotaRole.id">Required per day</label>
                        <input type="number" class="form-control" :class="{ 'is-invalid': rotaRole.requiredPerDay < 1 }" :name="'role-required-number-' + rotaRole.id" placeholder="Required per day" v-model="rotaRole.requiredPerDay" required min="1" />
                    </div>
                    <div class="col-12">
                        <SelectGroup :items="memberOptions" v-model="rotaRole.members" title="Who can be on the rota for this role?" />
                        <label class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" :checked="areAllMembersSelected(rotaRole)" @change="toggleSelectAllMembers(rotaRole)" />
                            <span class="form-check-label">Select all</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="col-1 d-flex align-items-center">
                <button class="btn btn-icon" aria-label="Remove row" @click="removeRotaRole(rotaRole.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                    </svg>
                </button>
            </div>
        </fieldset>
        <div class="d-flex justify-content-center">
            <button class="btn btn-icon" @click="addRotaRole">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
            </button>
        </div>`
}