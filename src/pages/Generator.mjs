import RotaMemberConfiguration from "../components/RotaMemberConfiguration.mjs";
import RotaRoleConfiguration from "../components/RotaRoleConfiguration.mjs";
import {css} from "../deps/goober.mjs";
import { AVOIDANCE_RULES, memberMap, roleMap, rotaMembers, rotaRoles, avoidanceRule, numberOfWeeks } from "../services/data.mjs";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const generateRotas = (numberOfWeeks, avoidanceRule) => {
    const rotas = [];
    const allocationCount = new Map();

    for (let i = 0; i < numberOfWeeks; i++) {
        const rota = {};

        // Initialize rota day data
        for (const day of days) {
            rota[day] = {};
        }

        // Initialize allocation count for each member
        for (const member of rotaMembers.value) {
            allocationCount.set(member.id, 0);
        }

        const filteredMembersByDay = days.reduce((acc, _, index) => {
            acc[index] = rotaMembers.value.filter(member => member.days.includes(String(index)));
            return acc;
        }, {});

        const sortedDaysByAvailability = days
            .map((_, index) => ({
                day: index,
                availableMembers: filteredMembersByDay[index].length
            }))
            .filter(day => day.availableMembers > 0)
            .sort((a, b) => a.availableMembers - b.availableMembers)
            .map(({ day }) => day);

        // Iterate through each day of the week (0-6)
        for (const day of sortedDaysByAvailability) {
            const dayInPreviousWeeks = rotas.map(rota => rota[days[day]]);
            const membersAvailableForDay = filteredMembersByDay[day];

            if (membersAvailableForDay.length === 0) {
                continue;
            }

            const unavailableMembersForDay = new Set();
            for (const role of rotaRoles.value) {
                const avoidMembersForRole = new Set();
                switch (avoidanceRule) {
                    case AVOIDANCE_RULES.AVOID_CONSECUTIVE_ROLES:
                        // From rotas, get the rota object for the current day and add all members with the current role to unavailableMembersForRole
                        for (const previousDay of dayInPreviousWeeks) {
                            Object.keys(previousDay).forEach(memberId => {
                                if (previousDay[memberId] === role.id) {
                                    avoidMembersForRole.add(memberId);
                                }
                            });
                        }
                        break;
                    case AVOIDANCE_RULES.AVOID_CONSECUTIVE_SHIFTS:
                        const dayInPreviousWeek = dayInPreviousWeeks.at(-1);
                        if (!dayInPreviousWeek) {
                            break;
                        }
                        Object.keys(dayInPreviousWeek).forEach(memberId => {
                            avoidMembersForRole.add(memberId);
                        });
                        break;
                    case AVOIDANCE_RULES.AVOID_DUPLICATE_SHIFTS:
                        dayInPreviousWeeks.forEach(dayInPreviousWeek => {
                            Object.keys(dayInPreviousWeek).forEach(memberId => {
                                avoidMembersForRole.add(memberId);
                            });
                        });
                        break;
                }
                // Sort available members by the number of times they have been allocated
                membersAvailableForDay.sort((a, b) => allocationCount.get(a.id) - allocationCount.get(b.id));
                const membersForRole = membersAvailableForDay.filter(member => role.members.includes(member.id) && !unavailableMembersForDay.has(member.id) && !avoidMembersForRole.has(member.id));

                // Group memberAvailableForDay into an array of arrays grouped by allocationCount
                const groupedMembers = [];
                let currentGroup = [];
                if (membersForRole.length > 0) {
                    let currentAllocationCount = allocationCount.get(membersForRole[0].id);
                    for (const member of membersForRole) {
                        if (allocationCount.get(member.id) !== currentAllocationCount) {
                            groupedMembers.push(currentGroup);
                            currentGroup = [];
                            currentAllocationCount = allocationCount.get(member.id);
                        }
                        currentGroup.push(member);
                    }
                }

                if (currentGroup.length > 0) {
                    groupedMembers.push(currentGroup);
                    currentGroup = [];
                }

                // We are avoiding these members rather than removing them from the chance of being allocated
                // Put them at the end of the list of possible allocations
                for (const memberId of Array.from(avoidMembersForRole).reverse()) {
                    if (!unavailableMembersForDay.has(memberId)) {
                        currentGroup.push(memberMap.value.get(memberId));
                    }
                }

                if (currentGroup.length > 0) {
                    if (avoidanceRule === AVOIDANCE_RULES.AVOID_DUPLICATE_SHIFTS) {
                        // If we are avoiding duplicate shifts, sort the group so that, if we have to assign a
                        // previously allocated member, we assign the one that was allocated the longest time ago
                        currentGroup.sort((a, b) => {
                            const aIndex = dayInPreviousWeeks.findIndex(day => day[a.id]);
                            const bIndex = dayInPreviousWeeks.findIndex(day => day[b.id]);
                            if (aIndex === -1) {
                                return 1;
                            }
                            if (bIndex === -1) {
                                return -1;
                            }
                            return aIndex - bIndex;
                        });
                    }
                    groupedMembers.push(currentGroup);
                    currentGroup = [];
                }

                let allocatedToRole = 0;
                while (allocatedToRole < role.requiredPerDay && groupedMembers.length > 0) {
                    // Randomly take an item from the first array in groupedMembers
                    const randomIndex = Math.floor(Math.random() * groupedMembers[0].length);
                    const randomMember = groupedMembers[0].splice(randomIndex, 1)[0];
                    rota[days[day]][randomMember.id] = role.id;
                    unavailableMembersForDay.add(randomMember.id);
                    allocationCount.set(randomMember.id, allocationCount.get(randomMember.id) + 1);
                    allocatedToRole++;
                    if (groupedMembers[0].length === 0) {
                        groupedMembers.shift();
                    }
                }
            }
        }

        rotas.push(rota);
    }

    return rotas;
};

const styles = css``;

export default {
    name: 'Generator',
    components: { RotaMemberConfiguration, RotaRoleConfiguration },
    data: () => ({ memberMap, rotaMembers, roleMap, avoidanceRule, numberOfWeeks, results: null }),
    methods: {
        generate(event) {
            if (!event.target.checkValidity()) return;
            event.preventDefault();
            // const data = new FormData(event.target);
            this.results = generateRotas(this.numberOfWeeks, this.avoidanceRule);
        },
        dayIncludesMember(day, memberId) {
            if (!Array.isArray(this.results[day])) {
                return false;
            }
            return this.results[day].findIndex(member => member.id === memberId) !== -1;
        }
    },
    template: `<div class="page-header">
        <div class="container-xl">
            <div class="row g-2 align-items-center">
                <div class="col">
                    <h2 class="page-title">
                        Generate rota
                    </h2>
                </div>
            </div>
        </div>
    </div>
    <!-- Page body -->
    <div class="page-body ${styles}">
        <div class="container-xl">
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Configure rota</h3>
                        </div>
                        <form @submit="generate">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <RotaMemberConfiguration />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <RotaRoleConfiguration />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <div class="form-label">Scheduling rules</div>
                                            <div>
                                                <label class="form-check">
                                                    <input class="form-check-input" type="radio" name="avoidanceRule" v-model="avoidanceRule" value="${AVOIDANCE_RULES.NONE}">
                                                    <span class="form-check-label">Staff can have the same shifts each week</span>
                                                </label>
                                                <label class="form-check">
                                                    <input class="form-check-input" type="radio" name="avoidanceRule" v-model="avoidanceRule" value="${AVOIDANCE_RULES.AVOID_CONSECUTIVE_ROLES}">
                                                    <span class="form-check-label">Staff can have the same shifts for different roles each week</span>
                                                </label>
                                                <label class="form-check">
                                                    <input class="form-check-input" type="radio" name="avoidanceRule" v-model="avoidanceRule" value="${AVOIDANCE_RULES.AVOID_CONSECUTIVE_SHIFTS}">
                                                    <span class="form-check-label">Avoid the same shift in concurrent weeks</span>
                                                </label>
                                                <label class="form-check">
                                                    <input class="form-check-input" type="radio" name="avoidanceRule" v-model="avoidanceRule" value="${AVOIDANCE_RULES.AVOID_DUPLICATE_SHIFTS}">
                                                    <span class="form-check-label">Avoid the same shift being scheduled twice</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label" for="number-of-weeks">Number of weeks to rota</label>
                                            <input type="number" class="form-control" id="number-of-weeks" name="number-of-weeks" v-model="numberOfWeeks" required min="1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer text-end">
                                <button class="btn btn-primary" type="submit">Generate</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="col-12" v-if="results !== null">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Rota Results</h3>
                        </div>
                        <div class="card-body table-responsive">
                            <template v-for="week, index in results">
                                <h4 class="mt-6">Week {{index + 1}}</h4>
                                <table class="table table-vcenter card-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th v-for="staff, day in week" :key="day">{{ day }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="member in rotaMembers" :key="member.id">
                                            <td>{{ member.name }}</td>
                                            <td v-for="staff, day in week" :key="day">
                                                <span v-if="member.id in staff">{{roleMap.get(staff[member.id]).name}}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
}
