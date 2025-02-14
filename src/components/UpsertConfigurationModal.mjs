import { AVOIDANCE_RULES } from "../constants.mjs";
import { createMember, createRole } from "../models.mjs";
import { addConfiguration, removeConfiguration } from "../services/configurations.mjs";
import Modal from "./Modal.mjs";
import RotaMemberConfiguration from "./RotaMemberConfiguration.mjs";
import RotaRoleConfiguration from "./RotaRoleConfiguration.mjs";

export default {
    name: 'UpsertConfigurationModal',
    components: { Modal, RotaMemberConfiguration, RotaRoleConfiguration },
    props: ['show', 'modelValue'],
    emits: ['update:show', 'update:modelValue'],
    data: () => ({ name: '', members: [createMember()], roles: [createRole()], avoidanceRule: AVOIDANCE_RULES.NONE, numberOfWeeks: 1 }),
    created() {
        if (!this.isCreate) {
            this.name = this.modelValue.name || '';
            this.members = this.modelValue.members || [];
            this.roles = this.modelValue.roles || [];
            this.avoidanceRule = this.modelValue.avoidanceRule || AVOIDANCE_RULES.NONE;
            this.numberOfWeeks = this.modelValue.numberOfWeeks || 1;
        }
    },
    computed: {
        isCreate() {
            return typeof this.modelValue === 'undefined';
        },
        lang() {
            if (this.isCreate) {
                return {
                    title: 'Create new configuration',
                    submit: 'Add',
                };
            }
            return {
                title: 'Edit configuration',
                submit: 'Update',
            };
        },
        isInvalid() {
            return this.name.trim().length === 0 ||
                    this.members.length === 0 ||
                    this.members.map(({ name }) => name).join('').length === 0 ||
                    this.roles.length === 0 ||
                    this.roles.map(({ name }) => name).join('').length === 0;
        }
    },
    template: `       
        <Modal :title="this.lang.title" :show="show" @update:show="$emit('update:show', false)">
            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-control" v-model="name" />
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="mb-3">
                            <RotaMemberConfiguration v-model="members" />
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="mb-3">
                            <RotaRoleConfiguration v-model="roles" :members="members" v-if="members.length > 0 && members.map(({ name }) => name).join('').trim().length > 0" />
                            <div class="alert alert-info" v-else>
                                Add members to the rota before adding roles
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-6">
                        <div class="mb-3">
                            <label class="form-label">Scheduling rules</label>
                            <select class="form-select" v-model="avoidanceRule">
                                <option value="${AVOIDANCE_RULES.NONE}">Staff can have the same shifts each week</option>
                                <option value="${AVOIDANCE_RULES.AVOID_CONSECUTIVE_ROLES}">Staff can have the same shifts for different roles each week</option>
                                <option value="${AVOIDANCE_RULES.AVOID_CONSECUTIVE_SHIFTS}">Avoid the same shift in concurrent weeks</option>
                                <option value="${AVOIDANCE_RULES.AVOID_DUPLICATE_SHIFTS}">Avoid the same shift being scheduled twice</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="mb-3">
                        <label class="form-label" for="number-of-weeks">Number of weeks to rota</label>
                        <input type="number" class="form-control" id="number-of-weeks" name="number-of-weeks" v-model="numberOfWeeks" required min="1" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-link link-secondary" @click="$emit('update:show', false)">Cancel</button>
                <div class="ms-auto">
                    <button class="btn btn-danger ms-auto me-2" @click="deleteConfiguration" v-if="!isCreate">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Delete
                    </button>
                    <button class="btn btn-primary ms-auto" :disabled="isInvalid" @click="addConfiguration">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        {{this.lang.submit}}
                    </button>
                </div>
          </div>
        </Modal>`,
        methods: {
            addConfiguration() {
                const configuration = {
                    name: this.name,
                    members: this.members,
                    roles: this.roles,
                    avoidanceRule: this.avoidanceRule,
                    numberOfWeeks: this.numberOfWeeks,
                };
                if (!this.isCreate) {
                    configuration.uid = this.modelValue.uid;
                }
                addConfiguration(configuration);
                this.$emit('update:show', false);
            },
            deleteConfiguration() {
                removeConfiguration(this.modelValue.uid);
                this.$emit('update:show', false);
            }
        }
}
