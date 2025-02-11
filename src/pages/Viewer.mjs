import { css } from "../deps/goober.mjs";
import { NoConfigurationError, InvalidConfigurationError } from "../errors.mjs";
import { generatedRotas, generateRotasFromSelectedConfiguration, selectedConfiguration, selectedConfigurationUid } from "../services/activeData.mjs";
import { configurations } from "../services/configurations.mjs";

const styles = css``;

export default {
    name: 'Viewer',
    data: () => ({ configurations, selectedConfigurationUid, selectedConfiguration, selectedWeek: 0, generatedRotas, error: null }),
    created() {
        if (this.generatedRotas === null) {
            this.generateRotas();
        }
    },
    watch: {
        selectedConfiguration() {
            this.generateRotas();
        },
    },
    computed: {
        shownRotaWeek() {
            if (!this.generatedRotas || this.generatedRotas.length <= this.selectedWeek) {
                return {};
            }
            return this.generatedRotas[this.selectedWeek];
        },
        rotaMembers() {
            return this.selectedConfiguration.members;
        },
        roleMap() {
            const map = new Map();
            for (const rotaRole of this.selectedConfiguration.roles) {
                map.set(rotaRole.id, rotaRole);
            }
            return map;
        },
        isFirst() {
            return this.selectedWeek === 0;
        },
        isLast() {
            if (!this.generatedRotas) return true;
            return this.selectedWeek === this.generatedRotas.length - 1;
        },
    },
    methods: {
        generateRotas() {
            try {
                generateRotasFromSelectedConfiguration();
                this.error = null;
            } catch (error) {
                let errorData = {
                    title: 'Error',
                    message: 'An error occurred while generating the rota.',
                };
                if (error instanceof InvalidConfigurationError) {
                    errorData = {
                        title: 'Invalid configuration',
                        message: 'The rota configuration needs at least one member and one role.',
                    };
                } else if (error instanceof NoConfigurationError) {
                    errorData = {
                        title: 'Setup required',
                        message: 'Please create a rota configuration before viewing the rota.',
                    };
                }
                this.error = errorData;
                console.debug(error);
            }
        },
        async downloadRotas() {
            const { XLSX } = await import('../deps/xlsx.mjs');
            var workbook = XLSX.utils.book_new();
            for (let week = 0; week < this.generatedRotas.length; week++) {
                const weekRota = this.generatedRotas[week];
                const data = [
                    ["Member", ...Object.keys(weekRota)],
                ];
                for (const member of this.rotaMembers) {
                    const row = [member.name];
                    for (const allocatedStaff of Object.values(weekRota)) {
                        let cell = "";
                        if (member.id in allocatedStaff) {
                            cell = this.roleMap.get(allocatedStaff[member.id]).name;
                        }
                        row.push(cell);
                    }
                    data.push(row);
                }
                const sheet = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(workbook, sheet, 'Week ' + (week + 1));
            }
            XLSX.writeFile(workbook, `${this.selectedConfiguration.name} - ${new Date().toISOString().substring(0, 10)}.xlsx`);
        },
        nextWeek() {
            if (!this.isLast) {
                this.selectedWeek = Math.min(this.selectedWeek + 1, this.generatedRotas.length - 1);
            }
        },
        previousWeek() {
            if (!this.isFirst) {
                this.selectedWeek = Math.max(this.selectedWeek - 1, 0);
            }
        },
    },
    template: /*html*/`
        <div class="page-body ${styles}">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex">
                                    <ul class="pagination mb-0">
                                        <li class="page-item" :class="{ disabled: isFirst }">
                                            <button class="page-link" @click="previousWeek" :tabindex="isFirst ? -1 : null" :aria-disabled="isFirst ? 'true' : null">
                                                <!-- Download SVG icon from http://tabler.io/icons/icon/chevron-left -->
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-1"><path d="M15 6l-6 6l6 6"></path></svg>
                                            </button>
                                        </li>
                                        <li class="page-item"><span class="page-link">Week {{selectedWeek + 1}}</span></li>
                                        <li class="page-item" :class="{ disabled: isLast }">
                                            <button class="page-link" @click="nextWeek" :tabindex="isLast ? -1 : null" :aria-disabled="isLast ? 'true' : null">
                                                <!-- Download SVG icon from http://tabler.io/icons/icon/chevron-right -->
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-1"><path d="M9 6l6 6l-6 6"></path></svg>
                                            </button>
                                        </li>
                                    </ul>
                                    <div class="ms-auto">
                                        <div class="row g-2">
                                            <div class="col-auto">
                                                <select class="form-select" v-model="selectedConfigurationUid">
                                                    <option v-for="configuration in configurations" :value="configuration.uid">{{ configuration.name }}</option>
                                                </select>
                                            </div>
                                            <div class="col-auto">
                                                <button class="btn btn-icon" @click="generateRotas" aria-label="Refresh rotas">
                                                    <!-- Download SVG icon from http://tabler.io/icons/icon/refresh -->
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-refresh"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
                                                </button>
                                            </div>
                                            <div class="col-auto">
                                                <button class="btn btn-icon" @click="downloadRotas" aria-label="Download rotas">
                                                    <!-- Download SVG icon from http://tabler.io/icons/icon/download -->
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                                                </button>
                                            </div>
                                            <div class="col-auto">
                                                <a class="btn btn-icon" href="#/configure" aria-label="Edit configuration">
                                                    <!-- Download SVG icon from http://tabler.io/icons/icon/settings -->
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="text-center py-4" v-if="error">
                                    <!-- Download SVG icon from http://tabler.io/icons/icon/alert-triangle -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon mb-2 text-warning icon-lg"><path d="M12 9v4"></path><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"></path><path d="M12 16h.01"></path></svg>
                                    <h3>{{error.title}}</h3>
                                    <div class="text-secondary">{{error.message}}</div>
                                </div>
                                <table class="table table-vcenter card-table" v-else>
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th v-for="staff, day in shownRotaWeek" :key="day">{{ day }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="member in rotaMembers" :key="member.id">
                                            <td>{{ member.name }}</td>
                                            <td v-for="staff, day in shownRotaWeek" :key="day">
                                                <span v-if="member.id in staff">{{roleMap.get(staff[member.id]).name}}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
}