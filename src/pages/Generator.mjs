import RotaMemberConfiguration from "../components/RotaMemberConfiguration.mjs";
import {css} from "../deps/goober.mjs";
import { memberMap, rotaMembers } from "../services/data.mjs";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const generateWeeklyRota = (peoplePerDay) => {
    const rota = {};
    const allocationCount = new Map();

    for (const day of days) {
        rota[day] = [];
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
        const membersAvailableForDay = filteredMembersByDay[day];

        // Sort available members by the number of times they have been allocated
        membersAvailableForDay.sort((a, b) => allocationCount.get(a.id) - allocationCount.get(b.id));

        if (membersAvailableForDay.length === 0) {
            rota[days[day]] = [];
            continue;
        }

        // Group memberAvailableForDay into an array of arrays grouped by allocationCount
        let currentAllocationCount = allocationCount.get(membersAvailableForDay[0].id);
        const groupedMembers = [];
        let currentGroup = [];
        for (const member of membersAvailableForDay) {
            if (allocationCount.get(member.id) !== currentAllocationCount) {
                groupedMembers.push(currentGroup);
                currentGroup = [];
                currentAllocationCount = allocationCount.get(member.id);
            }
            currentGroup.push(member);
        }

        if (currentGroup.length > 0) {
            groupedMembers.push(currentGroup);
        }

        while (rota[days[day]].length < peoplePerDay && groupedMembers.length > 0) {
            // Randomly take an item from the first array in groupedMembers
            const randomIndex = Math.floor(Math.random() * groupedMembers[0].length);
            const randomMember = groupedMembers[0].splice(randomIndex, 1)[0];
            rota[days[day]].push(randomMember.id);
            allocationCount.set(randomMember.id, allocationCount.get(randomMember.id) + 1);
            if (groupedMembers[0].length === 0) {
                groupedMembers.shift();
            }
        }
    }

    return rota;
};

const styles = css``;

export default {
    name: 'Generator',
    components: { RotaMemberConfiguration },
    data: () => ({ memberMap, rotaMembers, numberOfPeople: 1, results: null }),
    methods: {
        generate(event) {
            if (!event.target.checkValidity()) return;
            event.preventDefault();
            // const data = new FormData(event.target);
            this.results = generateWeeklyRota(this.numberOfPeople);
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
                                            <label class="form-label required">Number of people on each day</label>
                                            <input type="number" class="form-control" name="number-on-rota" placeholder="Number of people" min="1" :max="rotaMembers.length" v-model="numberOfPeople">
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
                            <table class="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th v-for="staff, day in results" :key="day">{{ day }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="member in rotaMembers" :key="member.id">
                                        <td>{{ member.name }}</td>
                                        <td v-for="staff, day in results" :key="day">
                                            <span v-if="results[day] && results[day].includes(member.id)">✓</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
}
